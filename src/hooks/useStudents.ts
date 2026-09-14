import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { mockStudents } from '@/lib/demoData'
import {
  createStudent,
  deleteStudent,
  fetchStudents,
  saveStudentSortOrder,
  updateStudent,
} from '@/lib/api'
import { getStorageItem, setStorageItem } from '@/lib/storage'
import type { Student, StudentInput } from '@/types'

function withPhotoDisplay(student: Student): Student {
  return {
    ...student,
    photoUrl:
      student.photoUrl ??
      (student.photo_path?.startsWith('data:') || student.photo_path?.startsWith('http')
        ? student.photo_path
        : null),
  }
}

/** Ensure every student has a contiguous sort_order and list is sorted. */
function normalizeOrder(list: Student[]): Student[] {
  return [...list]
    .map((s, i) => ({
      ...s,
      sort_order: typeof s.sort_order === 'number' ? s.sort_order : i,
    }))
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name))
    .map((s, i) => ({ ...s, sort_order: i }))
}

export function useStudents() {
  const { isDemo } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (isDemo) {
      const stored = normalizeOrder(
        getStorageItem('demo_students', mockStudents).map(withPhotoDisplay),
      )
      setStorageItem('demo_students', stored)
      setStudents(stored)
      setLoading(false)
      return
    }

    try {
      const data = await fetchStudents()
      setStudents(normalizeOrder(data))
    } catch (err) {
      setError(err instanceof Error ? err.message : '학생 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [isDemo])

  useEffect(() => {
    void load()
  }, [load])

  const persistDemoStudents = (next: Student[]) => {
    const ordered = normalizeOrder(next)
    setStorageItem('demo_students', ordered)
    setStudents(ordered)
  }

  const addStudent = async (input: StudentInput) => {
    if (isDemo) {
      const nextOrder = students.length
      const created: Student = {
        ...input,
        id: crypto.randomUUID(),
        user_id: 'demo-user-001',
        photo_path: input.photo_path ?? null,
        photoUrl:
          input.photo_path?.startsWith('data:') || input.photo_path?.startsWith('http')
            ? input.photo_path
            : null,
        sort_order: nextOrder,
        created_at: new Date().toISOString(),
      }
      persistDemoStudents([...students, created])
      return created
    }

    const created = await createStudent(input)
    setStudents((prev) => normalizeOrder([...prev, created]))
    return created
  }

  const editStudent = async (id: string, input: Partial<StudentInput>) => {
    if (isDemo) {
      const updated = students.map((student) => {
        if (student.id !== id) return student
        const next = { ...student, ...input }
        const path =
          input.photo_path !== undefined ? (input.photo_path ?? null) : (student.photo_path ?? null)
        const photoUrl = !path
          ? null
          : path.startsWith('data:') || path.startsWith('http')
            ? path
            : null
        return {
          ...next,
          photo_path: path,
          photoUrl,
        }
      })
      persistDemoStudents(updated)
      return updated.find((student) => student.id === id)!
    }

    const updated = await updateStudent(id, input)
    setStudents((prev) => prev.map((s) => (s.id === id ? updated : s)))
    return updated
  }

  const removeStudent = async (id: string) => {
    if (isDemo) {
      persistDemoStudents(students.filter((student) => student.id !== id))
      return
    }

    await deleteStudent(id)
    setStudents((prev) => normalizeOrder(prev.filter((s) => s.id !== id)))
  }

  const moveStudent = async (id: string, direction: 'up' | 'down') => {
    const index = students.findIndex((s) => s.id === id)
    if (index < 0) return
    const swapWith = direction === 'up' ? index - 1 : index + 1
    if (swapWith < 0 || swapWith >= students.length) return

    const next = [...students]
    const a = next[index]!
    const b = next[swapWith]!
    next[index] = b
    next[swapWith] = a
    const ordered = next.map((s, i) => ({ ...s, sort_order: i }))
    setStudents(ordered)

    if (isDemo) {
      setStorageItem('demo_students', ordered)
      return
    }

    try {
      await saveStudentSortOrder(ordered.map((s) => s.id))
    } catch (err) {
      await load()
      throw err
    }
  }

  return {
    students,
    loading,
    error,
    reload: load,
    addStudent,
    editStudent,
    removeStudent,
    moveStudent,
  }
}
