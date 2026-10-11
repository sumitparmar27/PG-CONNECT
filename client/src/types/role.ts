export interface Role {
  _id: string
  name: string
  description: string
  permissions: string[]
  isSystem: boolean
  userCount: number
  createdAt: string
  updatedAt: string
}

export interface RolePayload {
  name: string
  description: string
  permissions: string[]
}
