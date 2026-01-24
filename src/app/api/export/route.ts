import { NextRequest, NextResponse } from 'next/server';
import { stringify } from 'csv-stringify/sync';
import { getResponses, getSurveyById } from '@/lib/googleSheets';

// GET: CSVエクスポート
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const surveyId = searchParams.get('surveyId');

        if (!surveyId) {
            return NextResponse.json(
                { success: false, error: 'Survey ID is required' },
                { status: 400 }
            );
        }

        const survey = await getSurveyById(surveyId);
        if (!survey) {
            return NextResponse.json(
                { success: false, error: 'Survey not found' },
                { status: 404 }
            );
        }

        const responses = await getResponses(surveyId);

        // CSVヘッダーを作成
        const headers = ['回答ID', '回答者名', '回答日時', ...survey.questions.map((q) => q.text)];

        // CSVデータを作成
        const rows = responses.map((response) => {
            const row: string[] = [
                response.id,
                response.respondentName,
                new Date(response.submittedAt).toLocaleString('ja-JP'),
            ];

            for (const question of survey.questions) {
                const answer = response.answers.find((a) => a.questionId === question.id);
                if (answer) {
                    if (Array.isArray(answer.value)) {
                        row.push(answer.value.join(', '));
                    } else {
                        row.push(answer.value);
                    }
                } else {
                    row.push('');
                }
            }

            return row;
        });

        const csvData = stringify([headers, ...rows], {
            bom: true, // UTF-8 BOMを追加（Excel対応）
        });

        const filename = `${survey.title}_responses_${new Date().toISOString().split('T')[0]}.csv`;

        return new NextResponse(csvData, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
            },
        });
    } catch (error) {
        console.error('Error in GET /api/export:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to export CSV' },
            { status: 500 }
        );
    }
}
