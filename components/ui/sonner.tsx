import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'var(--bg-overlay)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-primary)',
          borderRadius: '10px',
          fontSize: '13px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          width: '320px',
          padding: '14px 16px',
        },
        classNames: {
          toast: "group toast",
          description: "group-[.toast]:text-[var(--text-muted)]",
          actionButton: "group-[.toast]:bg-[var(--accent)] group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-[var(--bg-elevated)] group-[.toast]:text-[var(--text-secondary)]",
          success: "[&_[data-icon]]:text-[var(--success)]",
          error: "[&_[data-icon]]:text-[var(--danger)]",
          warning: "[&_[data-icon]]:text-[var(--warning)]",
          info: "[&_[data-icon]]:text-[var(--info)]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
