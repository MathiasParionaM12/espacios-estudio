export interface Item {
  id: number
  name: string
  campus: string
  capacity: number
  availableSlots: number
}

export interface Detail extends Item {
  slots: { id: number; startsAt: string; available: boolean }[]
}