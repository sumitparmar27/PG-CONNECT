import { useEffect, useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { createUserRequest, listRolesRequest, listUsersRequest, updateUserRoleRequest, updateUserStatusRequest } from '../../api/admin.api'
import type { AdminUser } from '../../types/user'
import type { Role } from '../../types/role'
import { useAuth } from '../../hooks/useAuth'
import { generateTempPassword } from '../../lib/password'
import { Pagination } from '../../components/Pagination'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { FormModal } from '../../components/FormModal'
import { inputClass, labelClass } from '../../components/PgFormFields'
import { AlertIcon, BanIcon, CheckIcon, EditIcon, PlusIcon, SearchIcon } from '../../components/icons'
import { authAlertClass, authSubmitClass, gridErrorClass, statusBadgeClass, tableClass, tableWrapClass, tdClass, thClass } from '../../lib/ui'
import { cn } from '../../lib/utils'

const selectClass = 'rounded-sm border-[1.5px] border-border bg-code-bg px-2.5 py-2 text-sm text-text-h'
const readOnlyValueClass = 'rounded-sm border-[1.5px] border-border bg-code-bg px-3 py-2.5 text-[14.5px] text-text'
const actionBtnClass =
  'inline-flex cursor-pointer items-center gap-[5px] rounded-[7px] border border-border bg-transparent px-2.5 py-1.5 text-[12.5px] font-semibold whitespace-nowrap text-text-h not-disabled:hover:border-accent-border not-disabled:hover:bg-accent-bg not-disabled:hover:text-accent disabled:cursor-not-allowed disabled:opacity-40'
const actionBtnDangerClass =
  'not-disabled:hover:border-[#f3c3b2] not-disabled:hover:bg-[#fdeeea] not-disabled:hover:text-[#b3261e]'

const EMPTY_NEW_USER = { name: '', email: '', password: '', role: 'user' }

export function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [items, setItems] = useState<AdminUser[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [q, setQ] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [suspendTarget, setSuspendTarget] = useState<AdminUser | null>(null)
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState(EMPTY_NEW_USER)
  const [createError, setCreateError] = useState('')
  const [creating, setCreating] = useState(false)
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null)
  const [editRole, setEditRole] = useState('')
  const [editError, setEditError] = useState('')
  const [editSaving, setEditSaving] = useState(false)

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
  useEffect(() => {
    listRolesRequest()
      .then((data) => setRoles(data.roles))
      .catch(() => setRoles([]))
  }, [])

  function updateFilter(setter: (value: string) => void, value: string) {
    setter(value)
    setPage(1)
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

  function handleStatusClick(target: AdminUser) {
    if (target.isActive) {
      setSuspendTarget(target)
    } else {
      applyStatusChange(target, true)
    }
  }

  function openEdit(target: AdminUser) {
    setEditTarget(target)
    setEditRole(target.role)
    setEditError('')
  }

  function closeEdit() {
    setEditTarget(null)
    setEditError('')
  }

  async function handleEditSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editTarget) return
    setEditError('')
    setEditSaving(true)
    try {
      if (editRole !== editTarget.role) {
        await updateUserRoleRequest(editTarget._id, editRole)
      }
      closeEdit()
      load()
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined
      setEditError(message || 'Could not update this user.')
    } finally {
      setEditSaving(false)
    }
  }

  function closeAddUser() {
    setShowAddUser(false)
    setNewUser(EMPTY_NEW_USER)
    setCreateError('')
  }

  async function handleCreateUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCreateError('')
    setCreating(true)
    try {
      await createUserRequest(newUser)
      closeAddUser()
      setPage(1)
      load()
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined
      setCreateError(message || 'Could not create this user.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="m-0 text-[26px]">Users</h1>
          <p className="m-0 text-[13.5px] text-text">
            {total} account{total === 1 ? '' : 's'}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-[7px] border border-accent-border bg-accent-bg px-3.5 py-2 text-[13px] font-semibold whitespace-nowrap text-accent hover:brightness-105"
          onClick={() => setShowAddUser(true)}
        >
          <PlusIcon width={14} height={14} />
          Add user
        </button>
      </div>

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
          {roles.map((r) => (
            <option key={r._id} value={r.name}>
              {r.name}
            </option>
          ))}
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
                    <span className={statusBadgeClass(u.role === 'admin' ? 'ok' : 'pending')}>{u.role}</span>
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
                        onClick={() => openEdit(u)}
                      >
                        <EditIcon width={14} height={14} />
                        Edit
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
        isOpen={suspendTarget !== null}
        title="Suspend this account?"
        message={`${suspendTarget?.name} will be signed out and blocked from logging in until reactivated.`}
        confirmLabel="Suspend"
        danger
        onConfirm={() => {
          if (suspendTarget) applyStatusChange(suspendTarget, false)
          setSuspendTarget(null)
        }}
        onCancel={() => setSuspendTarget(null)}
      />

      <FormModal isOpen={editTarget !== null} title="Edit user" onClose={closeEdit}>
        <form className="flex flex-col gap-3.5" onSubmit={handleEditSubmit}>
          <label className={labelClass}>
            <span>Name</span>
            <span className={readOnlyValueClass}>{editTarget?.name}</span>
          </label>
          <label className={labelClass}>
            <span>Email</span>
            <span className={readOnlyValueClass}>{editTarget?.email}</span>
          </label>
          <label className={labelClass}>
            <span>Role</span>
            <select className={inputClass} value={editRole} onChange={(e) => setEditRole(e.target.value)}>
              {roles.map((r) => (
                <option key={r._id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>

          {editError && (
            <p className={authAlertClass} role="alert">
              <AlertIcon />
              {editError}
            </p>
          )}

          <div className="mt-1 flex justify-end gap-2.5">
            <button
              type="button"
              className="cursor-pointer rounded-sm border border-border bg-transparent px-4 py-2 text-sm font-semibold text-text-h hover:bg-code-bg"
              onClick={closeEdit}
            >
              Cancel
            </button>
            <button className={cn(authSubmitClass, 'mt-0 w-auto px-4 py-2')} type="submit" disabled={editSaving}>
              {editSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </FormModal>

      <FormModal isOpen={showAddUser} title="Add a user" onClose={closeAddUser}>
        <form className="flex flex-col gap-3.5" onSubmit={handleCreateUser}>
          <label className={labelClass}>
            <span>Name</span>
            <input
              className={inputClass}
              value={newUser.name}
              onChange={(e) => setNewUser((c) => ({ ...c, name: e.target.value }))}
              required
            />
          </label>
          <label className={labelClass}>
            <span>Email</span>
            <input
              className={inputClass}
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser((c) => ({ ...c, email: e.target.value }))}
              required
            />
          </label>
          <label className={labelClass}>
            <span>Temporary password</span>
            <div className="flex gap-2">
              <input
                className={cn(inputClass, 'flex-1')}
                type="text"
                minLength={6}
                value={newUser.password}
                onChange={(e) => setNewUser((c) => ({ ...c, password: e.target.value }))}
                placeholder="At least 6 characters"
                required
              />
              <button
                type="button"
                className="cursor-pointer rounded-sm border border-border bg-transparent px-3 py-2 text-[12.5px] font-semibold whitespace-nowrap text-text-h hover:border-accent-border hover:bg-accent-bg hover:text-accent"
                onClick={() => setNewUser((c) => ({ ...c, password: generateTempPassword() }))}
              >
                Generate
              </button>
            </div>
          </label>
          <label className={labelClass}>
            <span>Role</span>
            <select
              className={inputClass}
              value={newUser.role}
              onChange={(e) => setNewUser((c) => ({ ...c, role: e.target.value }))}
            >
              {roles.map((r) => (
                <option key={r._id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>

          {createError && (
            <p className={authAlertClass} role="alert">
              <AlertIcon />
              {createError}
            </p>
          )}

          <div className="mt-1 flex justify-end gap-2.5">
            <button
              type="button"
              className="cursor-pointer rounded-sm border border-border bg-transparent px-4 py-2 text-sm font-semibold text-text-h hover:bg-code-bg"
              onClick={closeAddUser}
            >
              Cancel
            </button>
            <button className={cn(authSubmitClass, 'mt-0 w-auto px-4 py-2')} type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create user'}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  )
}
