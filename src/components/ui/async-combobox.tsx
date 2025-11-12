"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface AsyncComboboxProps<T> {
  queryKey: string[]
  queryFn: (search: string) => Promise<T[]>
  value?: string
  onSelect?: (value: string) => void
  getOptionLabel: (option: T) => string
  getOptionValue: (option: T) => string
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
}

export function AsyncCombobox<T>({
  queryKey,
  queryFn,
  value,
  onSelect,
  getOptionLabel,
  getOptionValue,
  placeholder = "Selecione...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "Nenhum resultado encontrado.",
  disabled = false,
  className,
}: AsyncComboboxProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const { data: options = [], isLoading } = useQuery({
    queryKey: [...queryKey, search],
    queryFn: () => queryFn(search),
    enabled: open,
  })

  const selectedOption = options.find(
    (option) => getOptionValue(option) === value
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {selectedOption ? getOptionLabel(selectedOption) : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <>
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => {
                    const optionValue = getOptionValue(option)
                    const isSelected = value === optionValue
                    return (
                      <CommandItem
                        key={optionValue}
                        value={optionValue}
                        onSelect={() => {
                          onSelect?.(isSelected ? "" : optionValue)
                          setOpen(false)
                          setSearch("")
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {getOptionLabel(option)}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

