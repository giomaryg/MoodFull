"use client"

import * as React from "react"
import { useCallback, useContext, useEffect, useState } from "react"
import { Drawer } from "vaul"
import { Check, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const SelectContext = React.createContext({});

const Select = ({ children, value, onValueChange, defaultValue, disabled, ...props }) => {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(value || defaultValue)
  const [items, setItems] = React.useState({})

  const handleValueChange = (newValue) => {
    setInternalValue(newValue)
    onValueChange?.(newValue)
    setOpen(false)
  }

  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value)
    }
  }, [value])

  const registerItem = React.useCallback((val, label) => {
    setItems(prev => ({ ...prev, [val]: label }))
  }, [])

  return (
    <SelectContext.Provider value={{ value: internalValue, onValueChange: handleValueChange, open, setOpen, disabled, items, registerItem }}>
      <Drawer.Root open={open} onOpenChange={setOpen} {...props}>
        {children}
      </Drawer.Root>
    </SelectContext.Provider>
  )
}

const SelectGroup = React.forwardRef(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("py-2", className)} {...props} />;
})
SelectGroup.displayName = "SelectGroup"

const SelectValue = React.forwardRef((props, ref) => {
  const { className, placeholder, ...restProps } = props;
  const { value, items } = React.useContext(SelectContext)
  
  const displayValue = value ? (items[value] || value) : placeholder

  return (
    <span ref={ref} className={cn("truncate", className)} {...restProps}>
      {displayValue}
    </span>
  )
})
SelectValue.displayName = "SelectValue"

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { disabled } = React.useContext(SelectContext)
  return (
    <Drawer.Trigger asChild>
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "flex h-11 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 min-h-[44px]",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    </Drawer.Trigger>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <Drawer.Portal>
      <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
      <Drawer.Content
        ref={ref}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
          className
        )}
        {...props}
      >
        <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
        <div className="p-4 pb-8 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </Drawer.Content>
    </Drawer.Portal>
  );
})
SelectContent.displayName = "SelectContent"

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold text-muted-foreground", className)} {...props} />;
})
SelectLabel.displayName = "SelectLabel"

const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
  const { value: selectedValue, onValueChange, registerItem } = React.useContext(SelectContext)
  const isSelected = selectedValue === value

  React.useEffect(() => {
    registerItem(value, children)
  }, [value, children, registerItem])

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-md py-3 pl-3 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground min-h-[44px] mb-1 transition-colors",
        isSelected && "bg-accent text-accent-foreground font-medium",
        className
      )}
      onClick={() => onValueChange(value)}
      {...props}
    >
      <span className="absolute right-4 flex h-4 w-4 items-center justify-center">
        {isSelected && <Check className="h-4 w-4 text-primary" />}
      </span>
      {children}
    </div>
  )
})
SelectItem.displayName = "SelectItem"

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />;
})
SelectSeparator.displayName = "SelectSeparator"

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
}