import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCustomers, fetchInvoiceById } from '@/app/lib/data';
// to handle the errors when id doesn't exist - use this for patient ids that don't exist
import { notFound } from 'next/navigation';
export default async function Page({params} : { params : { id: string}}) {
    const id = params.id;
    const [invoice, customers] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers()
    ]);

    // conditional to invoke the notFound function if the invoice doesn't exist
    if(!invoice) {
        notFound();
    }

    return (
        <main>
            <Breadcrumbs breadcrumbs={[
                {label: 'Invoices', href: '/dashboard/invoices'},
                {
                    label: 'Edit Invoice',
                    href: `/dashboard/invoices/${id}/edit`,
                    active: true,
                },
            ]}
            />
            <Form invoice={invoice} customers={customers} />
        </main>
    );
    // Form passes data for the invoice and customers to the form component forward so you can edit it.
}