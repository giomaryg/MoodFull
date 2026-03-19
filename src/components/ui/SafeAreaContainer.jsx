import React from 'react';
import { cn } from '@/lib/utils';

export function SafeAreaContainer({ 
  children, 
  className, 
  top = false, 
  bottom = false, 
  left = true, 
  right = true,
  as: Component = 'div',
  ...props
}) {
  return (
    <Component 
      className={cn("w-full h-full", className)}
      style={{
        paddingTop: top ? 'env(safe-area-inset-top)' : undefined,
        paddingBottom: bottom ? 'env(safe-area-inset-bottom)' : undefined,
        paddingLeft: left ? 'env(safe-area-inset-left)' : undefined,
        paddingRight: right ? 'env(safe-area-inset-right)' : undefined,
        ...props.style
      }}
      {...props}
    >
      {children}
    </Component>
  );
}