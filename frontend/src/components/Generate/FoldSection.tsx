import { ChevronDown, Info } from "lucide-react"
import { type ReactNode, useState } from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/**
 * A card whose body can be folded away. The header always shows a one-line
 * summary so a folded section still tells the reader what is inside.
 * `forceOpen` keeps the body visible while it holds an error.
 */
export function FoldSection({
  title,
  summary,
  tip,
  defaultOpen = false,
  forceOpen = false,
  children,
}: {
  title: string
  summary?: ReactNode
  tip?: string
  defaultOpen?: boolean
  forceOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const shown = open || forceOpen
  return (
    <section className="rounded-xl border bg-card">
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          aria-expanded={shown}
          onClick={() => setOpen(!shown)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <h2 className="shrink-0 text-base font-semibold">{title}</h2>
          {summary && (
            <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
              {summary}
            </span>
          )}
          <ChevronDown
            className={cn(
              "ml-auto size-4 shrink-0 text-muted-foreground transition-transform",
              shown && "rotate-180",
            )}
            aria-hidden
          />
        </button>
        {/* Always reserve the tip slot so the chevrons of stacked sections line up. */}
        {tip ? (
          <InfoTip text={tip} label={`${title}说明`} />
        ) : (
          <span className="size-6 shrink-0" aria-hidden />
        )}
      </div>
      {shown && <div className="space-y-3 border-t px-4 py-4">{children}</div>}
    </section>
  )
}

/** A small "i" that opens a floating explanation on hover or keyboard focus. */
export function InfoTip({ text, label }: { text: string; label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
        >
          <Info className="size-4" aria-hidden />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        {text}
      </TooltipContent>
    </Tooltip>
  )
}
