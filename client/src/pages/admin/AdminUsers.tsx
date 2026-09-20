import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { listUsersRequest, updateUserRoleRequest, updateUserStatusRequest } from '../../api/admin.api'
import type { AdminUser } from '../../types/user'
import { useAuth } from '../../hooks/useAuth'
import { Pagination } from '../../components/Pagination'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { BanIcon, CheckIcon, SearchIcon } from '../../components/icons'
import { gridErrorClass, statusBadgeClass, tableClass, tableWrapClass, tdClass, thClass } from '../../lib/ui'
import { cn } from '../../lib/utils'

type PendingAction = { type: 'suspend' | 'demote'; user: AdminUser }

const selectClass = 'rounded-sm border-[1.5px] border-border bg-code-bg px-2.5 py-2 text-sm text-text-h'
const actionBtnClass =
  'inline-flex cursor-pointer items-center gap-[5px] rounded-[7px] border border-border bg-transparent px-2.5 py-1.5 text-[12.5px] font-semibold whitespace-nowrap text-text-h not-disabled:hover:border-accent-border not-disabled:hover:bg-accent-bg not-disabled:hover:text-accent disabled:cursor-not-allowed disabled:opacity-40'
const actionBtnDangerClass =
  'not-disabled:hover:border-[#f3c3b2] not-disabled:hover:bg-[#fdeeea] not-disabled:hover:text-[#b3261e]'

export function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [items, setItems] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [q, setQ] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)

  function load() {
    listUsersRequest({
      q: q || undefined,
      role: role || undefined,
      status: (status || undefined) as 'active' | 'suspended' | undefined,
      page,
    })
      .then((data) => {
        setItems(data.items)
        setTotal(data.total)
        setPages(data.pages)
      })
      .catch((err) => {
        const message = isAxiosError(err) ? err.response?.data?.message : undefined
        setError(message || 'Could not load users.')
      })
  }

  useEffect(load, [q, role, status, page])

  function updateFilter(setter: (value: string) => void, value: string) {
    setter(value)
    setPage(1)
  }

  async function applyRoleChange(target: AdminUser, nextRole: 'user' | 'admin') {
    setBusyId(target._id)
    setError('')
    try {
      await updateUserRoleRequest(target._id, nextRole)
      load()
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined
      setError(message || 'Could not update this user’s role.')
    } finally {
      setBusyId(null)
    }
  }

  async function applyStatusChange(target: AdminUser, isActive: boolean) {
    setBusyId(target._id)
    setError('')
    try {
      await updateUserStatusRequest(target._id, isActive)
      load()
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined
      setError(message || 'Could not update this user’s status.')
    } finally {
      setBusyId(null)
    }
  }

  function handleRoleClick(target: AdminUser) {
    if (target.role === 'admin') {
      setPendingAction({ type: 'demote', user: target })
    } else {
      applyRoleChange(target, 'admin')
    }
  }

  function handleStatusClick(target: AdminUser) {
    if (target.isActive) {
      setPendingAction({ type: 'suspend', user: target })
    } else {
      applyStatusChange(target, true)
    }
  }

  function confirmPendingAction() {
    if (!pendingAction) return
    if (pendingAction.type === 'demote') applyRoleChange(pendingAction.user, 'user')
    if (pendingAction.type === 'suspend') applyStatusChange(pendingAction.user, false)
    setPendingAction(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="m-0 text-[26px]">Users</h1>
      <p className="m-0 text-[13.5px] text-text">
        {total} account{total === 1 ? '' : 's'}
      </p>

      <div className="flex flex-wrap gap-2.5">
        <label className="flex min-w-[220px] flex-1 items-center gap-2 rounded-sm border-[1.5px] border-border bg-code-bg px-3 py-2 text-text">
          <SearchIcon width={16} height={16} />
          <input
            className="flex-1 border-none bg-transparent text-sm text-text-h outline-none"
            value={q}
            onChange={(e) => updateFilter(setQ, e.target.value)}
            placeholder="Search by name or email"
          />
        </label>
        <select className={selectClass} value={role} onChange={(e) => updateFilter(setRole, e.target.value)}>
          <option value="">All roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <select className={selectClass} value={status} onChange={(e) => updateFilter(setStatus, e.target.value)}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {error && <p className={gridErrorClass}>{error}</p>}

      <div className={tableWrapClass}>
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>Name</th>
              <th className={thClass}>Email</th>
              <th className={thClass}>Role</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Joined</th>
              <th className={thClass}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => {
              const isSelf = currentUser?._id === u._id
              return (
                <tr key={u._id}>
                  <td className={tdClass}>{u.name}</td>
                  <td className={tdClass}>{u.email}</td>
                  <td className={tdClass}>
                    <span className={statusBadgeClass(u.role === 'admin' ? 'ok' : 'pending')}>
                      {u.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className={tdClass}>
                    <span className={statusBadgeClass(u.isActive ? 'ok' : 'danger')}>
                      {u.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className={tdClass}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className={tdClass}>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className={actionBtnClass}
                        disabled={isSelf || busyId === u._id}
                        onClick={() => handleRoleClick(u)}
                      >
                        {u.role === 'admin' ? 'Demote' : 'Promote'}
                      </button>
                      <button
                        type="button"
                        className={cn(actionBtnClass, u.isActive && actionBtnDangerClass)}
                        disabled={isSelf || busyId === u._id}
                        onClick={() => handleStatusClick(u)}
                      >
                        {u.isActive ? (
                          <>
                            <BanIcon width={14} height={14} />
                            Suspend
                          </>
                        ) : (
                          <>
                            <CheckIcon width={14} height={14} />
                            Reactivate
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pages={pages} onChange={setPage} />

      <ConfirmDialog
        isOpen={pendingAction !== null}
        title={pendingAction?.type === 'demote' ? 'Remove admin access?' : 'Suspend this account?'}
        message={
          pendingAction?.type === 'demote'
            ? `${pendingAction.user.name} will lose admin access and go back to a regular user.`
            : `${pendingAction?.user.name} will be signed out and blocked from logging in until reactivated.`
        }
        confirmLabel={pendingAction?.type === 'demote' ? 'Demote' : 'Suspend'}
        danger
        onConfirm={confirmPendingAction}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  )
}
