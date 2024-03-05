import { cn } from '@/lib/utils'
import React from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'

type CardProps = React.ComponentProps<typeof Card>
type CustomerCardProps = CardProps & {
    cardHeader?: React.ReactNode
    cardContent?: React.ReactNode
    cardFooter?: React.ReactNode
}

const CustomCard: React.FC<CustomerCardProps> = ({ className, cardContent, cardFooter, cardHeader, ...props }) => {
    return (
        <Card className={cn('w-[380px]', className)} {...props}>
            <CardHeader>{cardHeader}</CardHeader>
            <CardContent className='grid gap-4'>{cardContent}</CardContent>
            <CardFooter>{cardFooter}</CardFooter>
        </Card>
    )
}

export default CustomCard