import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import {
  fetchTeacherShipping,
  saveTeacherShipping,
} from '@/lib/storeApi'
import { DemoNotice } from '@/components/shared/DemoNotice'
import type { TeacherProfileShipping } from '@/types/store'

const emptyShipping: TeacherProfileShipping = {
  school_name: '',
  shipping_address: '',
  shipping_contact: '',
  admin_office_note: '',
}

export function SettingsPage() {
  const { user, isDemo, updateDisplayName } = useAuth()
  const [nameInput, setNameInput] = useState(user?.name ?? '선생님')
  const [saved, setSaved] = useState(false)
  const [shipping, setShipping] = useState<TeacherProfileShipping>(emptyShipping)
  const [shippingSaved, setShippingSaved] = useState(false)
  const [shippingError, setShippingError] = useState<string | null>(null)
  const [shippingLoading, setShippingLoading] = useState(true)

  useEffect(() => {
    setNameInput(user?.name ?? '선생님')
  }, [user?.name])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setShippingLoading(true)
      try {
        const data = await fetchTeacherShipping(isDemo)
        if (mounted) setShipping(data)
      } catch {
        if (mounted) setShipping(emptyShipping)
      } finally {
        if (mounted) setShippingLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [isDemo])

  const handleSave = () => {
    updateDisplayName(nameInput)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  const handleSaveShipping = async () => {
    setShippingError(null)
    try {
      await saveTeacherShipping(isDemo, shipping)
      setShippingSaved(true)
      window.setTimeout(() => setShippingSaved(false), 2000)
    } catch (err) {
      setShippingError(err instanceof Error ? err.message : '저장에 실패했습니다.')
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">설정</h1>
        <p className="mt-1 text-muted-foreground">앱 사용 환경을 설정합니다.</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">프로필</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teacher-name">표시 이름</Label>
            <Input
              id="teacher-name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="김선생님"
            />
          </div>
          {user?.email ? (
            <p className="text-sm text-muted-foreground">계정: {user.email}</p>
          ) : null}
          <Button type="button" onClick={handleSave}>
            {saved ? '저장됨' : '저장'}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">학교 · 배송 (스토어 후불)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isDemo ? (
            <DemoNotice>
              데모에서는 배송 정보가 이 기기에만 저장됩니다. 실제 계정 연동 시 profiles 테이블에
              저장되며 주문 시 기본값으로 쓰입니다.
            </DemoNotice>
          ) : null}
          {shippingLoading ? (
            <p className="text-sm text-muted-foreground">불러오는 중...</p>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="school-name">학교명</Label>
                <Input
                  id="school-name"
                  value={shipping.school_name}
                  onChange={(e) =>
                    setShipping((prev) => ({ ...prev, school_name: e.target.value }))
                  }
                  placeholder="○○초등학교"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shipping-address">배송 주소</Label>
                <Textarea
                  id="shipping-address"
                  value={shipping.shipping_address}
                  onChange={(e) =>
                    setShipping((prev) => ({
                      ...prev,
                      shipping_address: e.target.value,
                    }))
                  }
                  placeholder="학교 주소, 행정실 위치 등"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shipping-contact">연락처</Label>
                <Input
                  id="shipping-contact"
                  value={shipping.shipping_contact}
                  onChange={(e) =>
                    setShipping((prev) => ({
                      ...prev,
                      shipping_contact: e.target.value,
                    }))
                  }
                  placeholder="010-0000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-note">행정실 참고 메모</Label>
                <Textarea
                  id="admin-note"
                  value={shipping.admin_office_note}
                  onChange={(e) =>
                    setShipping((prev) => ({
                      ...prev,
                      admin_office_note: e.target.value,
                    }))
                  }
                  placeholder="담당 부서, 수령 방법 등"
                  rows={2}
                />
              </div>
              {shippingError ? (
                <p className="text-sm text-destructive">{shippingError}</p>
              ) : null}
              <Button type="button" onClick={() => void handleSaveShipping()}>
                {shippingSaved ? '배송 정보 저장됨' : '배송 정보 저장'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {isDemo ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 text-sm text-muted-foreground">
            데모 모드에서는 샘플 학생·스토어 주문이 이 기기에만 저장됩니다. 실제 DB 연동은
            회원가입 후 이용해 주세요. 스토어 마이그레이션은{' '}
            <code>supabase/migrations/004_store.sql</code> 입니다.
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
