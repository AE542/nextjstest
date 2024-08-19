import { Card } from '@/app/ui/dashboard/cards';
import { sql } from '@vercel/postgres';
import RevenueChart from 'app/ui/dashboard/revenue-chart';
import LatestInvoices from 'app/ui/dashboard/latest-invoices';
import { lusitana } from 'app/ui/fonts';
//import { fetchCardData } from 'app/lib/data';
// removed fetchRevenue.
import { Suspense } from 'react';
// Suspense allows you to wrap this around a component as opposed to loading the whole page with overview.
import { RevenueChartSkeleton, LatestInvoicesSkeleton, CardsSkeleton  } from '@/app/ui/skeletons';
// have a skeleton component for the revenue chart to be used instead
import CardWrapper from '@/app/ui/dashboard/cards';

export default async function Page() {
    //const revenue = await fetchRevenue();
    //const latestInvoices = await fetchLatestInvoices();
    
    // const totalPaidInvoices = (await fetchCardData()).totalPaidInvoices
    // const totalPendingInvoices = (await fetchCardData()).totalPendingInvoices
    // const numberOfInvoices = (await fetchCardData()).numberOfInvoices
    // const numberOfCustomers = (await fetchCardData()).numberOfCustomers

    // this is how you can access the data from the API by declaring it here and then calling it below in the revenue component
    // alternate way to do this that avoids repetition and is cleaner is to destructure the data from the API like this:
    // const { totalPaidInvoices, totalPendingInvoices, numberOfInvoices, numberOfCustomers } = await fetchCardData();
    return (<main>
        <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>Dashboard</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
           {/* <Card title="Collected" value={totalPaidInvoices} type="collected" />
        <Card title="Pending" value={totalPendingInvoices} type="pending" />
        <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
        <Card
          title="Total Customers"
          value={numberOfCustomers}
          type="customers"
        /> */}
        <Suspense fallback={<CardsSkeleton/>}>
          <CardWrapper />
          </Suspense>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
            <Suspense fallback={<RevenueChartSkeleton/>}>
            <RevenueChart/>
            </Suspense>
            <Suspense fallback={<LatestInvoicesSkeleton/>}>
            <LatestInvoices/>  
            </Suspense>
            </div>
    </main>
);
}