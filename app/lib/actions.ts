'use server';
// By adding the 'use server', you mark all the exported functions within the file as Server Actions. These server functions can then be imported and used in Client and Server components.

// add signIn and auth error for updating the login form

import { signIn } from '@/auth';
import { AuthError } from 'next-auth'
;
import { z } from 'zod';
// for type validation
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce.number().gt(0,{ message: 'Please enter an amount more than $0.'}),
    // gt = greater than
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.',
    }),
    date: z.string(),
})

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
}

const CreateInvoice = FormSchema.omit({id: true, date: true});

const UpdateInvoice = FormSchema.omit({id: true, date: true});

export async function createInvoice(prevState: State, formData: FormData) {
    // we need to extract the data from the form data object

    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    if(!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to create invoice'
        }
    }

    const {customerId, amount, status} = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    // It's usually good practice to store monetary values in cents in your database to eliminate JavaScript floating-point errors and ensure greater accuracy.
    const amountInCents = amount * 100;

    // Finally, let's create a new date with the format "YYYY-MM-DD" for the invoice's creation date:

    const date = new Date().toISOString().split('T')[0];

    // inserting try catch to handle errors

    try {

    // create sql query to insert new invoice into the database

    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date});
    `;

    } catch (error) {
        // you can return an error message as below:
        return {
            message: 'Database Error: Failed to create invoice'
        };
    }
    // Next.js has a Client-side Router Cache that stores the route segments in the user's browser for a time. Along with prefetching, this cache ensures that users can quickly navigate between routes while reducing the number of requests made to the server.

    // Since you're updating the data displayed in the invoices route, you want to clear this cache and trigger a new request to the server. You can do this with the revalidatePath function from Next.js:

    revalidatePath('/dashboard/invoices');
    
    //Once the database has been updated, the /dashboard/invoices path will be revalidated, and fresh data will be fetched from the server.

    // At this point, you also want to redirect the user back to the /dashboard/invoices page. You can do this with the redirect function from Next.js:

    redirect('/dashboard/invoices');

    // Testing
    // console.log(rawFormData);
    // console.log(typeof rawFormData.amount);

   
}

// just as above create an updateInvoice function

export async function updateInvoice(id: string, prevState: State, formData: FormData,) {
    // make sure the params are in the correct order otherwise State will not work properly in the edit-form.tsx

    const validatedFields = UpdateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    if(!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to create invoice'
        }
    }

    const { customerId, amount, status } = validatedFields.data;

    // const { customerId, amount, status } = UpdateInvoice.parse({
    //     customerId: formData.get('customerId'),
    //     amount: formData.get('amount'),
    //     status: formData.get('status'),
    // });
    
    const amountInCents = amount * 100;

    try {

    await sql`
        UPDATE invoices
        SET customer_id = ${customerId},
            amount = ${amountInCents},
            status = ${status}
        WHERE id = ${id};
    `;

    } catch {
        return {
        message: 'Database Error: Failed to update invoice'
    }
}

    revalidatePath('/dashboard/invoices');
    
    //Once the database has been updated, the /dashboard/invoices path will be revalidated, and fresh data will be fetched from the server.

    // At this point, you also want to redirect the user back to the /dashboard/invoices page. You can do this with the redirect function from Next.js:

    redirect('/dashboard/invoices');

}

// same as before, create a deleteInvoice function

export async function deleteInvoice(id: string) {
    // testing errors:
    // throw new Error('Failed to delete invoice')

    // Seeing these errors are helpful while developing as you can catch any potential problems early. However, you also want to show errors to the user to avoid an abrupt failure and allow your application to continue running.
    // This is where Next.js error.tsx file comes in.

    try {
    await sql`
        DELETE FROM invoices
        WHERE id = ${id};
    `;
        revalidatePath('/dashboard/invoices');
        return {message: 'Invoice deleted.'};
    } catch {
        return {
            message: 'Database Error: Failed to delete invoice'
        }
    }
    
    //Once the database has been updated, the /dashboard/invoices path will be revalidated, and fresh data will be fetched from the server.

    // At this point, you also want to redirect the user back to the /dashboard/invoices page. You can do this with the redirect function from Next.js:
}

// Now you need to connect the auth logic with your login form. In your actions.ts file, create a new action called authenticate. This action should import the signIn function from auth.ts:

export async function authenticate( prevState: string | undefined, formData: FormData, ) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin': 
                return 'Invalid credentials.';
                default:
                return 'Something went wrong.'
            }
        }
        throw error;
        // If there's a 'CredentialsSignin' error, you want to show an appropriate error message. You can learn about NextAuth.js errors in the documentation
    }
}