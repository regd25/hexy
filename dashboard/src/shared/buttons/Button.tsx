import React from 'react'

type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'outline'
    | 'ghost'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'

type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    size?: ButtonSize
    fullWidth?: boolean
}

function buildVariantClasses(variant: ButtonVariant): string {
    if (variant === 'primary') return 'bg-blue-600 hover:bg-blue-700 text-white'
    if (variant === 'secondary')
        return 'bg-background-secondary hover:bg-background-tertiary text-white border border-gray-700'
    if (variant === 'tertiary') return 'bg-gray-700 hover:bg-gray-600 text-gray-100'
    if (variant === 'outline')
        return 'bg-transparent border border-gray-600 text-gray-100 hover:bg-background-secondary'
    if (variant === 'ghost') return 'bg-transparent text-gray-100 hover:bg-background-secondary'
    if (variant === 'success') return 'bg-emerald-600 hover:bg-emerald-700 text-white'
    if (variant === 'warning') return 'bg-amber-600 hover:bg-amber-700 text-white'
    if (variant === 'danger') return 'bg-red-600 hover:bg-red-700 text-white'
    return 'bg-cyan-600 hover:bg-cyan-700 text-white'
}

function buildSizeClasses(size: ButtonSize): string {
    if (size === 'xs') return 'px-3 py-1.5 text-xs rounded-md'
    if (size === 'sm') return 'px-3 py-2 text-sm rounded-md'
    if (size === 'md') return 'px-4 py-2.5 text-sm rounded-lg'
    if (size === 'lg') return 'px-5 py-3 text-base rounded-lg'
    return 'h-9 w-9 inline-flex items-center justify-center rounded-md'
}

export function Button({
    children,
    variant = 'secondary',
    size = 'md',
    fullWidth = false,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const base =
        'transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 disabled:opacity-60 disabled:cursor-not-allowed'
    const width = fullWidth ? 'w-full' : ''
    const classes = [base, buildVariantClasses(variant), buildSizeClasses(size), width, className]
        .filter(Boolean)
        .join(' ')

    return (
        <button
            className={classes}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    )
}
