import { ModuleForm } from '@/components/modules/ModuleForm'

export default function NewModulePage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">New Module</h1>
        <p className="text-sm text-muted-foreground">Create a new learning module</p>
      </div>
      <ModuleForm />
    </div>
  )
}
