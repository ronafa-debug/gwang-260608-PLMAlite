import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'

export function SettingsPage() {
  const { user, isDemo, updateDisplayName } = useAuth()
  const [nameInput, setNameInput] = useState(user?.name ?? '선생님')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setNameInput(user?.name ?? '선생님')
  }, [user?.name])

  const handleSave = () => {
    updateDisplayName(nameInput)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
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

      {isDemo ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 text-sm text-muted-foreground">
            데모 모드에서는 샘플 학생 데이터로 체험할 수 있습니다. 자료 저장은 회원가입 후
            이용해 주세요.
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
