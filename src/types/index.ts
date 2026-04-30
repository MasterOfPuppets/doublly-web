export interface UserDto {
  id: string
  email: string
  firstName: string
  lastName: string
  language: string
  country: string
  defaultTimezone: string
}

export interface AccountDto {
  id: string
  parentAccountId: string | null
  name: string
  referenceValue: number
  timezone: string | null
}

export interface AccountNodeStateDto {
  branchOpen: boolean
  // pinned?: boolean   (future)
  // locked?: boolean   (future)
}

export interface AccountBusinessStateDto {
  operation: string | null
  referenceId: string | null
}

export interface AccountTreeDto {
  id: string
  name: string
  referenceValue: number
  totalAmount: number
  deviation: number
  nodeState: AccountNodeStateDto
  businessState: AccountBusinessStateDto
  movements: MovementDto[]
  subAccounts: AccountTreeDto[]
}

export interface MovementDto {
  id: string
  accountId: string
  amount: number
  movementDate: string
  description: string | null
  createdAt: string
  updatedAt: string
  isConsolidation: boolean
}

export interface SubscriptionDto {
  id: string
  planName: string
  status: string
  startDate: string
  endDate: string
}
