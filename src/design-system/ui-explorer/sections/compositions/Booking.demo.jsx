import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertIcon, AlertTitle } from "@/components/ui/alert"
import { DatePicker, DatePickerTrigger, DatePickerContent } from "@/components/ui/date-picker"
import { TimePicker, TimePickerTrigger, TimePickerContent } from "@/components/ui/time-picker"
import { formatDate } from "@/lib/utils/date-utils"
import { formatTime } from "@/lib/utils/time-utils"
import { Calendar, Clock, MessageSquare, CheckCircle2, ArrowRight } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

export default function BookingDemo() {
  const [state, setState] = React.useState('form') // 'form' | 'success' | 'loading'
  const [date, setDate] = React.useState('')
  const [time, setTime] = React.useState('')
  const [notes, setNotes] = React.useState('')
  const [error, setError] = React.useState(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showNotes, setShowNotes] = React.useState(false)

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  // Format date for display
  const formatDateDisplay = (dateString) => {
    if (!dateString) return 'Not set'
    return formatDate(dateString, 'long')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!date) {
      setError('Please select a date')
      return
    }
    if (!time) {
      setError('Please select a time')
      return
    }

    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setState('success')
    }, 1500)
  }

  const handleReset = () => {
    setState('form')
    setDate('')
    setTime('')
    setNotes('')
    setError(null)
    setShowNotes(false)
  }

  // Success State
  if (state === 'success') {
    return (
      <Card className="shadow-elevated animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-full bg-success-bg p-3 animate-in zoom-in duration-300">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
                <CardTitle className="text-2xl">Booking Confirmed</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Your installation has been scheduled successfully
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-success/30 bg-success-bg p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-success/20 p-2 mt-0.5">
                <Calendar className="h-5 w-5 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wide text-success font-medium mb-1">
                  Installation Date
                </p>
                <p className="text-lg font-semibold text-success">
                  {formatDateDisplay(date)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-success/20 p-2 mt-0.5">
                <Clock className="h-5 w-5 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wide text-success font-medium mb-1">
                  Preferred Time
                </p>
                <p className="text-lg font-semibold text-success">
                  {time ? formatTime(time, '12h') : time}
                </p>
              </div>
            </div>
            {notes && (
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-success/20 p-2 mt-0.5">
                  <MessageSquare className="h-5 w-5 text-success" />
                </div>
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wide text-success font-medium mb-1">
                    Additional Notes
                  </p>
                  <p className="text-sm text-success">{notes}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1"
          >
            Book Another
          </Button>
          <Button
            variant="default"
            className="flex-1 bg-gradient-to-r from-primary to-secondary"
          >
            View Details
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Form State
  return (
    <Card className="shadow-elevated animate-in fade-in duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-full bg-primary/15 p-3">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Schedule Installation</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Choose your preferred date and time
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Date and Time Inputs */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Preferred Date
              </label>
              <DatePicker
                value={date}
                onValueChange={setDate}
                minDate={today}
                disabled={isSubmitting}
              >
                <DatePickerTrigger placeholder="Select date" />
                <DatePickerContent />
              </DatePicker>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Preferred Time
              </label>
              <TimePicker
                value={time}
                onValueChange={setTime}
                format="12h"
                interval={15}
                disabled={isSubmitting}
              >
                <TimePickerTrigger placeholder="Select time" />
                <TimePickerContent />
              </TimePicker>
            </div>
          </div>

          {/* Notes Section - Collapsible */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center justify-between w-full text-sm font-medium text-foreground hover:text-primary transition-colors"
              aria-expanded={showNotes}
            >
              <span>Additional Notes (Optional)</span>
              <span className="text-muted-foreground">{showNotes ? '−' : '+'}</span>
            </button>
            {showNotes && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions or access details..."
                  rows={3}
                  disabled={isSubmitting}
                  className="rounded-xl border-border focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                  aria-label="Additional notes for installation"
                />
              </div>
            )}
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="error" className="animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertIcon variant="error" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting || !date || !time}
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-secondary text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Processing...
            </>
          ) : (
            <>
              Confirm Booking
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
