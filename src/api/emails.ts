import { supabase } from '../lib/supabase'

export interface SendEmailParams {
  to: string
  subject: string
  template: string
  data: any
  from_email?: string
  from_name?: string
}

/**
 * Send an email using the Supabase Edge Function
 */
export async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: params
    })

    if (error) {
      console.error('Error sending email:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Exception sending email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send booking request email to freelancer
 */
export async function sendBookingRequestEmail(params: {
  freelancerEmail: string
  freelancerName: string
  clientName: string
  startDate: string
  endDate: string
  rate: string
  bookingUrl: string
}) {
  return sendEmail({
    to: params.freelancerEmail,
    subject: `New booking request from ${params.clientName}`,
    template: 'booking-request',
    data: params
  })
}

/**
 * Send booking accepted email to client
 */
export async function sendBookingAcceptedEmail(params: {
  clientEmail: string
  clientName: string
  freelancerName: string
  startDate: string
  endDate: string
  bookingUrl: string
}) {
  return sendEmail({
    to: params.clientEmail,
    subject: `Booking accepted by ${params.freelancerName}!`,
    template: 'booking-accepted',
    data: params
  })
}

/**
 * Send booking declined email to client
 */
export async function sendBookingDeclinedEmail(params: {
  clientEmail: string
  clientName: string
  freelancerName: string
  discoverUrl: string
}) {
  return sendEmail({
    to: params.clientEmail,
    subject: `Booking request update`,
    template: 'booking-declined',
    data: params
  })
}

/**
 * Send booking cancelled email
 */
export async function sendBookingCancelledEmail(params: {
  recipientEmail: string
  recipientName: string
  cancelledBy: string
  startDate: string
  endDate: string
  bookingUrl: string
}) {
  return sendEmail({
    to: params.recipientEmail,
    subject: 'Booking cancelled',
    template: 'booking-cancelled',
    data: params
  })
}

/**
 * Send booking completed email
 */
export async function sendBookingCompletedEmail(params: {
  recipientEmail: string
  recipientName: string
  otherPartyName: string
  reviewUrl: string
}) {
  return sendEmail({
    to: params.recipientEmail,
    subject: 'Booking completed - Leave a review',
    template: 'booking-completed',
    data: params
  })
}

/**
 * Send application received email to organiser
 */
export async function sendApplicationReceivedEmail(params: {
  organiserEmail: string
  organiserName: string
  applicantName: string
  jobTitle: string
  roleName: string
  appliedDate: string
  applicationUrl: string
}) {
  return sendEmail({
    to: params.organiserEmail,
    subject: `New application for ${params.jobTitle}`,
    template: 'application-received',
    data: params
  })
}

/**
 * Send application selected email to freelancer
 */
export async function sendApplicationSelectedEmail(params: {
  applicantEmail: string
  applicantName: string
  jobTitle: string
  roleName: string
  organiserName: string
  jobUrl: string
}) {
  return sendEmail({
    to: params.applicantEmail,
    subject: `You've been selected for ${params.jobTitle}!`,
    template: 'application-selected',
    data: params
  })
}

/**
 * Send application rejected email to freelancer
 */
export async function sendApplicationRejectedEmail(params: {
  applicantEmail: string
  applicantName: string
  jobTitle: string
  jobsUrl: string
}) {
  return sendEmail({
    to: params.applicantEmail,
    subject: 'Application status update',
    template: 'application-rejected',
    data: params
  })
}

/**
 * Send new message email
 */
export async function sendNewMessageEmail(params: {
  recipientEmail: string
  recipientName: string
  senderName: string
  messagePreview: string
  messageUrl: string
}) {
  return sendEmail({
    to: params.recipientEmail,
    subject: `New message from ${params.senderName}`,
    template: 'new-message',
    data: params
  })
}
