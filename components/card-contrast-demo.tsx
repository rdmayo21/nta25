"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  HighContrastCard,
  HighContrastCardContent,
  HighContrastCardDescription,
  HighContrastCardFooter,
  HighContrastCardHeader,
  HighContrastCardTitle
} from "@/components/ui/high-contrast-card"
import { ThemeSwitcher } from "./utilities/theme-switcher"

export default function CardContrastDemo() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Card Contrast Demo</h1>
        <ThemeSwitcher className="flex items-center justify-center rounded-full bg-secondary p-2 hover:bg-secondary/80" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Regular Cards</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Standard Card</CardTitle>
              <CardDescription>
                This is a standard card with improved contrast
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Notice how the card now stands out better against the background 
                with enhanced borders and shadows.
              </p>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">Last updated: Today</p>
            </CardFooter>
          </Card>
          
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle>Muted Card</CardTitle>
              <CardDescription>
                A card with muted background
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Using the muted background color provides another level of contrast.
              </p>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">Last updated: Yesterday</p>
            </CardFooter>
          </Card>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">High Contrast Cards</h2>
          
          <HighContrastCard>
            <HighContrastCardHeader>
              <HighContrastCardTitle>High Contrast Card</HighContrastCardTitle>
              <HighContrastCardDescription>
                This high contrast card stands out even more
              </HighContrastCardDescription>
            </HighContrastCardHeader>
            <HighContrastCardContent>
              <p>
                For especially important content, this card uses stronger borders 
                and shadows to create maximum visual distinction.
              </p>
            </HighContrastCardContent>
            <HighContrastCardFooter>
              <p className="text-sm text-muted-foreground">Priority: High</p>
            </HighContrastCardFooter>
          </HighContrastCard>
          
          <HighContrastCard className="bg-primary/5 dark:bg-primary/10">
            <HighContrastCardHeader>
              <HighContrastCardTitle>Accent High Contrast</HighContrastCardTitle>
              <HighContrastCardDescription>
                Combining high contrast with accent colors
              </HighContrastCardDescription>
            </HighContrastCardHeader>
            <HighContrastCardContent>
              <p>
                This card uses color accents with high contrast styling for 
                maximum visual impact and hierarchy.
              </p>
            </HighContrastCardContent>
            <HighContrastCardFooter>
              <p className="text-sm text-muted-foreground">Status: Featured</p>
            </HighContrastCardFooter>
          </HighContrastCard>
        </div>
      </div>
    </div>
  )
} 