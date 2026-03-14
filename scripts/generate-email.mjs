import { render } from '@react-email/render';
import { ResetPasswordEmail } from '../src/emails/ResetPasswordEmail';
import fs from 'fs';

const html = render(ResetPasswordEmail({ 
    userFirstname: '{{ .Name }}', 
    resetPasswordLink: '{{ .ConfirmationURL }}' 
}));

fs.writeFileSync('supabase_email_reset.html', html);
console.log('HTML generado con éxito en supabase_email_reset.html');
