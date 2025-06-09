import React, { useState, useEffect } from "react";
import BillingOverview from "../../components/client/billing/BillingOverview";
import InvoicesList from "../../components/client/billing/InvoicesList";
import InvoiceDetail from "../../components/client/billing/InvoiceDetail";
import PaymentHistory from "../../components/client/billing/PaymentHistory";
import PaymentMethods from "../../components/client/billing/PaymentMethods";
import PaymentAlerts from "../../components/client/billing/PaymentAlerts";
import Navbar from '../../components/client/Navbar';
function BillingDashBoard() {
    const [overviewData, setOverviewData] = useState({
        total_revenue: 0,
        outstanding_balance: 0,
        recent_revenue_chart: [],
    });
    const [invoices, setInvoices] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [payments, setPayments] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        setOverviewData({
            total_revenue: 15000,
            outstanding_balance: 1200,
            recent_revenue_chart: [
                { date: "2025-06-01", amount: 500 },
                { date: "2025-06-02", amount: 700 },
                { date: "2025-06-03", amount: 1000 },
            ],
        });
        setInvoices([
            { id: "INV1001", date: "2025-06-01T00:00:00Z", status: "Paid", total: 1000 },
            { id: "INV1002", date: "2025-06-02T00:00:00Z", status: "Unpaid", total: 1500 },
        ]);
        setPayments([
            { id: "PAY1001", date: "2025-06-01T00:00:00Z", amount: 1000, method: "Credit Card", status: "Success" },
        ]);
        setPaymentMethods([
            { id: "PM1001", type: "Credit Card", details: "Visa ****1234" },
            { id: "PM1002", type: "PayPal", details: "user@example.com" },
        ]);
        setAlerts([{ message: "Invoice INV1002 is overdue!" }]);
    }, []);

    const handleSelectInvoice = (id) => {
        const invoice = invoices.find((inv) => inv.id === id);
        if (invoice) {
            setSelectedInvoice({
                ...invoice,
                items: [
                    { service: "Compute Instance", quantity: 2, unit_price: 300, total_price: 600 },
                    { service: "Block Storage", quantity: 1, unit_price: 400, total_price: 400 },
                ],
            });
        }
    };

    return (



        <div className="dark">
            <div className="fixed top-4 right-4 z-[100] space-y-2" id="toast-container" data-turbo-permanent="" />
            <Navbar credits={150} />

            <div
                className="billing-dashboard"
                style={{
                    display: "flex",
                    height: "100vh",
                    padding: 24,
                    maxWidth: 1200,
                    margin: "0 auto",
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    gap: 24,
                }}
            >
                {/* Left side: Overview + Alerts + Invoices List */}
                <div style={{ flex: "1 1 50%", display: "flex", flexDirection: "column", gap: 24 }}>
                    <BillingOverview data={overviewData} />
                    <PaymentAlerts alerts={alerts} />
                    <div style={{ flexGrow: 1, overflowY: "auto" }}>
                        <InvoicesList invoices={invoices} onSelectInvoice={handleSelectInvoice} />
                    </div>
                </div>

                {/* Right side: Invoice Detail + Payment History + Payment Methods */}
                <div style={{ flex: "1 1 50%", display: "flex", flexDirection: "column", gap: 24, overflowY: "auto" }}>
                    <InvoiceDetail invoice={selectedInvoice} />
                    <PaymentHistory payments={payments} />
                    <PaymentMethods methods={paymentMethods} />
                </div>
            </div>

        </div>

    );
}

export default BillingDashBoard;
