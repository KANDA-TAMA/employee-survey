import { notFound } from 'next/navigation';
import { getSurveyById } from '@/lib/googleSheets';
import SurveyPageClient from './SurveyPageClient';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function SurveyPage({ params }: PageProps) {
    // params is a Promise in recent Next.js versions (or will be soon, safe to await)
    const { id } = await params;

    const survey = await getSurveyById(id);

    if (!survey || !survey.isActive) {
        notFound();
    }

    return <SurveyPageClient survey={survey} />;
}
