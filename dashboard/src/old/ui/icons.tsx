export const Icon = ({
    children,
    className,
    stroke,
    fill,
    size,
}: {
    children: React.ReactNode
    className?: string
    stroke?: string
    fill?: string
    size?: number
}) => (
    <svg
        className={`w-${size ?? 4} h-${size ?? 4} ${className}`}
        fill={fill ?? 'none'}
        stroke={stroke ? stroke : 'currentColor'}
        viewBox="0 0 24 24"
    >
        {children}
    </svg>
)

export const SaveIcon = () => (
    <Icon>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
        />
    </Icon>
)

export const CancelIcon = () => (
    <Icon>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
        />
    </Icon>
)

export const ReformulateIcon = () => (
    <Icon>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
    </Icon>
)

export const ThinkingIcon = () => (
    <Icon>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
    </Icon>
)

export const AIIcon = () => (
    <Icon stroke="currentColor">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4C12 4 12 6 12 8C12 10 12 12 12 14C12 16 12 18 12 20M20 12C20 12 18 12 16 12C14 12 12 12 10 12C8 12 6 12 4 12"
        />
    </Icon>
)

export const EditIcon = () => (
    <Icon stroke="currentColor">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
    </Icon>
)

export const DeleteIcon = () => (
    <Icon>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
    </Icon>
)

export const AddIcon = () => (
    <Icon>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
        />
    </Icon>
)
