import AppLayout from "../../components/AppLayout";
import ChecklistForm from "../../components/checklist/ChecklistForm";

export default function EletricistaDashboard() {
    return (
        <AppLayout
            title="Área do Eletricista"
            subtitle="Execução dos checklists, medições, observações e envio das inspeções."
        >
            <ChecklistForm />
        </AppLayout>
    );
}