import { useEffect, useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { createRoleRequest, deleteRoleRequest, listRolesRequest, updateRoleRequest } from '../../api/admin.api'
import type { Role, RolePayload } from '../../types/role'
import { Permissions, PERMISSION_LABELS } from '../../constants/permissions'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { FormModal } from '../../components/FormModal'
import { inputClass, labelClass } from '../../components/PgFormFields'
import { AlertIcon, PlusIcon } from '../../components/icons'
import { authAlertClass, authSubmitClass, gridErrorClass, statusBadgeClass, tableClass, tableWrapClass, tdClass, thClass } from '../../lib/ui'
import { cn } from '../../lib/utils'

const EMPTY_ROLE: RolePayload = { name: '', description: '', permissions: [] }

const actionBtnClass =
  'inline-flex cursor-pointer items-center gap-[5px] rounded-[7px] border border-border bg-transparent px-2.5 py-1.5 text-[12.5px] font-semibold whitespace-nowrap text-text-h not-disabled:hover:border-accent-border not-disabled:hover:bg-accent-bg not-disabled:hover:text-accent disabled:cursor-not-allowed disabled:opacity-40'
const actionBtnDangerClass =
  'not-disabled:hover:border-[#f3c3b2] not-disabled:hover:bg-[#fdeeea] not-disabled:hover:text-[#b3261e]'
const permissionBadgeClass =
  'inline-flex items-center whitespace-nowrap rounded-full bg-code-bg px-2.5 py-1 text-[11px] font-semibold text-text-h'

export function AdminRoles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [form, setForm] = useState<RolePayload>(EMPTY_ROLE)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null)
  const [deleteError, setDeleteError] = useState('')

  function load() {
    listRolesRequest()
      .then((data) => setRoles(data.roles))
      .catch((err) => {
        const message = isAxiosError(err) ? err.response?.data?.message : undefined
        setError(message || 'Could not load roles.')
      })
  }

  useEffect(load, [])

  function openCreate() {
    setEditingRole(null)
    setForm(EMPTY_ROLE)
    setFormError('')
    setShowForm(true)
  }

  function openEdit(role: Role) {
    setEditingRole(role)
    setForm({ name: role.name, description: role.description, permissions: role.permissions })
    setFormError('')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingRole(null)
    setForm(EMPTY_ROLE)
    setFormError('')
  }

  function togglePermission(permission: string) {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((p) => p !== permission)
        : [...current.permissions, permission],
    }))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      if (editingRole) {
        await updateRoleRequest(editingRole._id, form)
      } else {
        await createRoleRequest(form)
      }
      closeForm()
      load()
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined
      setFormError(message || 'Could not save this role.')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleteError('')
    try {
      await deleteRoleRequest(deleteTarget._id)
      setDeleteTarget(null)
      load()
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined
      setDeleteError(message || 'Could not delete this role.')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="m-0 text-[26px]">Roles</h1>
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 text-[13.5px] text-text">
          {roles.length} role{roles.length === 1 ? '' : 's'} · custom roles control what staff accounts can access in this admin panel
        </p>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-[7px] border border-accent-border bg-accent-bg px-3.5 py-2 text-[13px] font-semibold whitespace-nowrap text-accent hover:brightness-105"
          onClick={openCreate}
        >
          <PlusIcon width={14} height={14} />
          Add role
        </button>
      </div>

      {error && <p className={gridErrorClass}>{error}</p>}

      <div className={tableWrapClass}>
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>Role</th>
              <th className={thClass}>Description</th>
              <th className={thClass}>Permissions</th>
              <th className={thClass}>Users</th>
              <th className={thClass}></th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role._id}>
                <td className={tdClass}>
                  <div className="flex items-center gap-2">
                    {role.name}
                    {role.isSystem && <span className={statusBadgeClass('pending')}>System</span>}
                  </div>
                </td>
                <td className={tdClass}>{role.description || '—'}</td>
                <td className={cn(tdClass, 'whitespace-normal')}>
                  {role.permissions.length === 0 ? (
                    '—'
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {role.permissions.map((p) => (
                        <span key={p} className={permissionBadgeClass}>
                          {PERMISSION_LABELS[p as (typeof Permissions)[keyof typeof Permissions]] || p}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className={tdClass}>{role.userCount}</td>
                <td className={tdClass}>
                  {!role.isSystem && (
                    <div className="flex gap-2">
                      <button type="button" className={actionBtnClass} onClick={() => openEdit(role)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className={cn(actionBtnClass, actionBtnDangerClass)}
                        onClick={() => {
                          setDeleteError('')
                          setDeleteTarget(role)
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <FormModal isOpen={showForm} title={editingRole ? 'Edit role' : 'Add a role'} onClose={closeForm}>
        <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
          <label className={labelClass}>
            <span>Role name</span>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
              placeholder="e.g. Support Staff"
              required
            />
          </label>
          <label className={labelClass}>
            <span>Description (optional)</span>
            <input
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
            />
          </label>
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-text-h">Permissions</span>
            <div className="flex flex-col gap-2 rounded border border-border p-3">
              {Object.values(Permissions).map((permission) => (
                <label key={permission} className="flex cursor-pointer items-center gap-2 text-[13.5px] font-medium text-text-h">
                  <input
                    className="size-4 p-0 accent-accent"
                    type="checkbox"
                    checked={form.permissions.includes(permission)}
                    onChange={() => togglePermission(permission)}
                  />
                  {PERMISSION_LABELS[permission]}
                </label>
              ))}
            </div>
          </div>

          {formError && (
            <p className={authAlertClass} role="alert">
              <AlertIcon />
              {formError}
            </p>
          )}

          <div className="mt-1 flex justify-end gap-2.5">
            <button
              type="button"
              className="cursor-pointer rounded-sm border border-border bg-transparent px-4 py-2 text-sm font-semibold text-text-h hover:bg-code-bg"
              onClick={closeForm}
            >
              Cancel
            </button>
            <button className={cn(authSubmitClass, 'mt-0 w-auto px-4 py-2')} type="submit" disabled={saving}>
              {saving ? 'Saving...' : editingRole ? 'Save changes' : 'Create role'}
            </button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Delete this role?"
        message={deleteError || `"${deleteTarget?.name}" will be permanently removed. This only works if no users are currently assigned to it.`}
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
