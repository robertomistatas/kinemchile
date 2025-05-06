"use server"

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface ContactFormData {
  nombre: string
  email: string
  mensaje: string
}

export async function sendContactForm(data: ContactFormData) {
  try {
    const { nombre, email, mensaje } = data

    await resend.emails.send({
      from: "Kinem Chile <no-reply@kinem.cl>",
      to: "admin@kinem.cl", // Cambia esto por el email del administrador
      subject: "Nueva solicitud de cuenta en Kinem Chile",
      text: `
        Nombre: ${nombre}
        Email: ${email}
        Mensaje: ${mensaje}
      `,
      html: `
        <h2>Nueva solicitud de cuenta</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong> ${mensaje}</p>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error("Error al enviar email:", error)
    throw new Error("Error al enviar el formulario")
  }
}
