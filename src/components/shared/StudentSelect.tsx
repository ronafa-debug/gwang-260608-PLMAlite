import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Student } from '@/types'

interface StudentSelectProps {
  students: Student[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function StudentSelect({
  students,
  value,
  onChange,
  placeholder = '학생을 선택하세요',
}: StudentSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {students.map((student) => (
          <SelectItem key={student.id} value={student.id}>
            {student.name} ({student.grade})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
