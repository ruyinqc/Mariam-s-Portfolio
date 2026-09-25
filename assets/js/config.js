/* ==========================================================================
   config.js — the only file with settings in it.
   Mariam: this is one of two files you ever need to touch. The other is data.js.
   ========================================================================== */

window.SITE = {

  /* ----------------------------------------------------------------------
     CONTACT FORM
     ----------------------------------------------------------------------
     Messages are sent through Resend by a tiny Cloudflare Worker (the code
     is in worker/contact.js — the README's section 1 walks through setting
     it up). Paste the Worker's address between the quotes below, e.g.
       https://portfolio-contact.your-name.workers.dev

     Until you do, the form still works — it falls back to opening the
     visitor's own mail app with the message pre-written. Nothing breaks,
     it's just a worse experience.
  */
  contactEndpoint: 'https://portfolio-contact.ruyinqc.workers.dev',

  email:     'marmaremad31@gmail.com',
  linkedin:  'https://www.linkedin.com/in/mariamemadnabih/',
  instagram: 'https://www.instagram.com/ruyi_nqc/',
  cv:        'assets/cv/Mariam-Emad-Nabih-Product-Designer-CV.pdf',

  /* ----------------------------------------------------------------------
     CERTIFICATES
     ----------------------------------------------------------------------
     ⚠️  Mariam — please check the three links flagged `verify: true`.
     Your CV lists the SAME Coursera URL for the CalArts, Google and Udacity
     certificates, and a Udacity certificate cannot live on coursera.org, so
     at least two of them are wrong. A dead certificate link costs you more
     credibility than having no link at all, so I have kept them exactly as
     your CV has them rather than guessing at replacements.
  */
  certificates: [
    {
      name:   'UX Management: Strategy & Tactics',
      issuer: 'Interaction Design Foundation',
      when:   'Feb 2026',
      url:    'https://ixdf.org/members/mariam-emad-2/certificate/course/3bd7254b-f970-49db-9124-866b26ca5335?certificateType=course'
    },
    {
      name:   'Agile Methods for UX Design',
      issuer: 'Interaction Design Foundation',
      when:   'Jun 2025',
      url:    'https://lnkd.in/dxqDQ7PF'
    },
    {
      name:   'Conducting Usability Testing',
      issuer: 'Interaction Design Foundation',
      when:   'Apr 2025',
      url:    'https://www.interaction-design.org/members/mariam-emad-2/certificate/course/bf1b9de6-a984-43af-95ef-5931a7ff7503'
    },
    {
      name:   'Fundamentals of Graphic Design',
      issuer: 'California Institute of the Arts',
      when:   'Jul 2024',
      url:    'https://www.coursera.org/account/accomplishments/verify/A9JXA6ADXGFJ',
      verify: true
    },
    {
      name:   'Start the UX Design Process: Empathize, Define, and Ideate',
      issuer: 'Google',
      when:   'Feb 2024',
      url:    'https://www.coursera.org/account/accomplishments/verify/A9JXA6ADXGFJ',
      verify: true
    },
    {
      name:   'Advanced Data Analysis',
      issuer: 'Udacity',
      when:   'May 2021',
      url:    'https://www.coursera.org/account/accomplishments/verify/A9JXA6ADXGFJ',
      verify: true
    }
  ]
};
