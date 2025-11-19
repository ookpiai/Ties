import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')

// Email template renderer
function renderTemplate(template: string, data: any): string {
  const templates: { [key: string]: (data: any) => string } = {
    'booking-request': (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 30px; background-color: #E03131; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px;">TIES Together</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="margin: 0 0 20px 0; color: #333; font-size: 22px;">New Booking Request</h2>
                    <p style="margin: 0 0 15px 0; color: #666; font-size: 16px;">Hi ${data.freelancerName},</p>
                    <p style="margin: 0 0 20px 0; color: #666; font-size: 16px;">
                      You have a new booking request from <strong>${data.clientName}</strong>.
                    </p>
                    <div style="background-color: #f8f8f8; padding: 20px; border-radius: 6px; margin: 20px 0;">
                      <p style="margin: 0 0 10px 0; color: #333;"><strong>Start Date:</strong> ${data.startDate}</p>
                      <p style="margin: 0 0 10px 0; color: #333;"><strong>End Date:</strong> ${data.endDate}</p>
                      <p style="margin: 0; color: #333;"><strong>Rate:</strong> ${data.rate}</p>
                    </div>
                    <a href="${data.bookingUrl}" style="display: inline-block; padding: 14px 30px; background-color: #E03131; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">View Booking Request</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 30px; background-color: #f8f8f8; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; font-size: 12px; color: #666;">
                      You received this email because you have a TIES Together account.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,

    'booking-accepted': (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 30px; background-color: #28a745; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px;">TIES Together</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="margin: 0 0 20px 0; color: #333; font-size: 22px;">Booking Accepted! 🎉</h2>
                    <p style="margin: 0 0 15px 0; color: #666; font-size: 16px;">Hi ${data.clientName},</p>
                    <p style="margin: 0 0 20px 0; color: #666; font-size: 16px;">
                      Great news! <strong>${data.freelancerName}</strong> has accepted your booking request.
                    </p>
                    <div style="background-color: #f8f8f8; padding: 20px; border-radius: 6px; margin: 20px 0;">
                      <p style="margin: 0 0 10px 0; color: #333;"><strong>Start Date:</strong> ${data.startDate}</p>
                      <p style="margin: 0 0 10px 0; color: #333;"><strong>End Date:</strong> ${data.endDate}</p>
                      <p style="margin: 0; color: #333;"><strong>Status:</strong> Confirmed</p>
                    </div>
                    <a href="${data.bookingUrl}" style="display: inline-block; padding: 14px 30px; background-color: #28a745; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">View Booking Details</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 30px; background-color: #f8f8f8; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; font-size: 12px; color: #666;">
                      You received this email because you have a TIES Together account.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,

    'booking-declined': (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 30px; background-color: #6c757d; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px;">TIES Together</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="margin: 0 0 20px 0; color: #333; font-size: 22px;">Booking Request Update</h2>
                    <p style="margin: 0 0 15px 0; color: #666; font-size: 16px;">Hi ${data.clientName},</p>
                    <p style="margin: 0 0 20px 0; color: #666; font-size: 16px;">
                      Unfortunately, <strong>${data.freelancerName}</strong> is not available for your requested dates.
                    </p>
                    <p style="margin: 0 0 20px 0; color: #666; font-size: 16px;">
                      Don't worry! There are many other talented professionals on TIES Together who would love to work with you.
                    </p>
                    <a href="${data.discoverUrl}" style="display: inline-block; padding: 14px 30px; background-color: #E03131; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">Find Other Professionals</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 30px; background-color: #f8f8f8; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; font-size: 12px; color: #666;">
                      You received this email because you have a TIES Together account.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,

    'booking-cancelled': (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 30px; background-color: #dc3545; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px;">TIES Together</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="margin: 0 0 20px 0; color: #333; font-size: 22px;">Booking Cancelled</h2>
                    <p style="margin: 0 0 15px 0; color: #666; font-size: 16px;">Hi ${data.recipientName},</p>
                    <p style="margin: 0 0 20px 0; color: #666; font-size: 16px;">
                      A booking has been cancelled by <strong>${data.cancelledBy}</strong>.
                    </p>
                    <div style="background-color: #f8f8f8; padding: 20px; border-radius: 6px; margin: 20px 0;">
                      <p style="margin: 0 0 10px 0; color: #333;"><strong>Dates:</strong> ${data.startDate} - ${data.endDate}</p>
                      <p style="margin: 0; color: #333;"><strong>Status:</strong> Cancelled</p>
                    </div>
                    <a href="${data.bookingUrl}" style="display: inline-block; padding: 14px 30px; background-color: #E03131; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">View Details</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 30px; background-color: #f8f8f8; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; font-size: 12px; color: #666;">
                      You received this email because you have a TIES Together account.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,

    'booking-completed': (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 30px; background-color: #28a745; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px;">TIES Together</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="margin: 0 0 20px 0; color: #333; font-size: 22px;">Booking Completed! ⭐</h2>
                    <p style="margin: 0 0 15px 0; color: #666; font-size: 16px;">Hi ${data.recipientName},</p>
                    <p style="margin: 0 0 20px 0; color: #666; font-size: 16px;">
                      Your booking with <strong>${data.otherPartyName}</strong> has been marked as completed.
                    </p>
                    <p style="margin: 0 0 20px 0; color: #666; font-size: 16px;">
                      We hope you had a great experience! Please take a moment to leave a review.
                    </p>
                    <a href="${data.reviewUrl}" style="display: inline-block; padding: 14px 30px; background-color: #E03131; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">Leave a Review</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 30px; background-color: #f8f8f8; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; font-size: 12px; color: #666;">
                      You received this email because you have a TIES Together account.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,

    'application-received': (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 30px; background-color: #E03131; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px;">TIES Together</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="margin: 0 0 20px 0; color: #333; font-size: 22px;">New Job Application</h2>
                    <p style="margin: 0 0 15px 0; color: #666; font-size: 16px;">Hi ${data.organiserName},</p>
                    <p style="margin: 0 0 20px 0; color: #666; font-size: 16px;">
                      <strong>${data.applicantName}</strong> has applied for your job: <strong>${data.jobTitle}</strong>
                    </p>
                    <div style="background-color: #f8f8f8; padding: 20px; border-radius: 6px; margin: 20px 0;">
                      <p style="margin: 0 0 10px 0; color: #333;"><strong>Role:</strong> ${data.roleName}</p>
                      <p style="margin: 0; color: #333;"><strong>Applied:</strong> ${data.appliedDate}</p>
                    </div>
                    <a href="${data.applicationUrl}" style="display: inline-block; padding: 14px 30px; background-color: #E03131; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">View Application</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 30px; background-color: #f8f8f8; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; font-size: 12px; color: #666;">
                      You received this email because you have a TIES Together account.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,

    'application-selected': (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 30px; background-color: #28a745; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px;">TIES Together</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="margin: 0 0 20px 0; color: #333; font-size: 22px;">Congratulations! You've Been Selected! 🎉</h2>
                    <p style="margin: 0 0 15px 0; color: #666; font-size: 16px;">Hi ${data.applicantName},</p>
                    <p style="margin: 0 0 20px 0; color: #666; font-size: 16px;">
                      Great news! You've been selected for <strong>${data.jobTitle}</strong>.
                    </p>
                    <div style="background-color: #f8f8f8; padding: 20px; border-radius: 6px; margin: 20px 0;">
                      <p style="margin: 0 0 10px 0; color: #333;"><strong>Role:</strong> ${data.roleName}</p>
                      <p style="margin: 0 0 10px 0; color: #333;"><strong>Organiser:</strong> ${data.organiserName}</p>
                      <p style="margin: 0; color: #333;"><strong>Status:</strong> Selected</p>
                    </div>
                    <a href="${data.jobUrl}" style="display: inline-block; padding: 14px 30px; background-color: #28a745; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">View Job Details</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 30px; background-color: #f8f8f8; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; font-size: 12px; color: #666;">
                      You received this email because you have a TIES Together account.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,

    'application-rejected': (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 30px; background-color: #6c757d; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px;">TIES Together</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="margin: 0 0 20px 0; color: #333; font-size: 22px;">Application Status Update</h2>
                    <p style="margin: 0 0 15px 0; color: #666; font-size: 16px;">Hi ${data.applicantName},</p>
                    <p style="margin: 0 0 20px 0; color: #666; font-size: 16px;">
                      Thank you for applying to <strong>${data.jobTitle}</strong>. While we appreciate your interest, we've decided to move forward with other candidates.
                    </p>
                    <p style="margin: 0 0 20px 0; color: #666; font-size: 16px;">
                      Don't be discouraged! There are many other exciting opportunities on TIES Together that might be a perfect fit for you.
                    </p>
                    <a href="${data.jobsUrl}" style="display: inline-block; padding: 14px 30px; background-color: #E03131; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">Browse Other Jobs</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 30px; background-color: #f8f8f8; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; font-size: 12px; color: #666;">
                      You received this email because you have a TIES Together account.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,

    'new-message': (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 30px; background-color: #E03131; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px;">TIES Together</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="margin: 0 0 20px 0; color: #333; font-size: 22px;">New Message from ${data.senderName}</h2>
                    <p style="margin: 0 0 15px 0; color: #666; font-size: 16px;">Hi ${data.recipientName},</p>
                    <p style="margin: 0 0 20px 0; color: #666; font-size: 16px;">
                      You have a new message from <strong>${data.senderName}</strong>.
                    </p>
                    <div style="background-color: #f8f8f8; padding: 20px; border-radius: 6px; margin: 20px 0;">
                      <p style="margin: 0; color: #666; font-style: italic;">"${data.messagePreview}"</p>
                    </div>
                    <a href="${data.messageUrl}" style="display: inline-block; padding: 14px 30px; background-color: #E03131; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">Read Message</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 30px; background-color: #f8f8f8; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; font-size: 12px; color: #666;">
                      You received this email because you have a TIES Together account.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  }

  const templateFn = templates[template]
  if (!templateFn) {
    throw new Error(`Template "${template}" not found`)
  }

  return templateFn(data)
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, template, data, from_email, from_name } = await req.json()

    if (!to || !subject || !template || !data) {
      throw new Error('Missing required fields: to, subject, template, data')
    }

    if (!SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY not configured')
    }

    // Render email template
    const html = renderTemplate(template, data)

    // Send via SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
            subject: subject
          }
        ],
        from: {
          email: from_email || 'noreply@tiestogether.com',
          name: from_name || 'TIES Together'
        },
        content: [
          {
            type: 'text/html',
            value: html
          }
        ]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('SendGrid error:', errorText)
      throw new Error(`SendGrid API error: ${response.status} - ${errorText}`)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
