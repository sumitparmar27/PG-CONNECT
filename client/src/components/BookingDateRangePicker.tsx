import { useEffect, useState } from 'react'
import { DayPicker, type DateRange } from 'react-day-picker'
import { getRoomAvailabilityRequest } from '../api/room.api'

function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfNextMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 2, 0)
}

const today = new Date()
today.setHours(0, 0, 0, 0)

interface BookingDateRangePickerProps {
  roomId: string
  range: DateRange | undefined
  onRangeChange: (range: DateRange | undefined) => void
}

export function BookingDateRangePicker({ roomId, range, onRangeChange }: BookingDateRangePickerProps) {
  const [month, setMonth] = useState(() => startOfMonth(today))
  const [availability, setAvailability] = useState<Record<string, number>>({})

  useEffect(() => {
    const from = formatDateKey(month)
    const to = formatDateKey(endOfNextMonth(month))
    getRoomAvailabilityRequest(roomId, from, to)
      .then((data) => setAvailability(data.availability))
      .catch(() => setAvailability({}))
  }, [roomId, month])

  return (
    <DayPicker
      mode="range"
      selected={range}
      onSelect={onRangeChange}
      month={month}
      onMonthChange={setMonth}
      numberOfMonths={1}
      disabled={[{ before: today }, (date) => availability[formatDateKey(date)] === 0]}
    />
  )
}
