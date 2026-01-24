import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSettings, initializeSheets } from '@/lib/googleSheets';
import { OrganizationSettings } from '@/lib/types';

// GET: 設定を取得
export async function GET() {
    try {
        const settings = await getSettings();
        return NextResponse.json({ success: true, data: settings });
    } catch (error) {
        console.error('Error in GET /api/settings:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

// PUT: 設定を更新
export async function PUT(request: NextRequest) {
    try {
        const body: OrganizationSettings = await request.json();

        if (!body.name) {
            return NextResponse.json(
                { success: false, error: 'Organization name is required' },
                { status: 400 }
            );
        }

        const settings = await updateSettings({
            name: body.name,
            employees: body.employees || [],
        });

        return NextResponse.json({ success: true, data: settings });
    } catch (error) {
        console.error('Error in PUT /api/settings:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update settings' },
            { status: 500 }
        );
    }
}

// POST: シートを初期化
export async function POST() {
    try {
        await initializeSheets();
        return NextResponse.json({ success: true, message: 'Sheets initialized successfully' });
    } catch (error) {
        console.error('Error in POST /api/settings:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to initialize sheets' },
            { status: 500 }
        );
    }
}
