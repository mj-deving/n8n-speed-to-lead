import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Setup CRM Sheet
// Nodes   : 3  |  Connections: 2
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// RunOnce                            webhook
// CreateSpreadsheet                  googleSheets               [creds]
// SetHeaders                         googleSheets               [creds]
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// RunOnce
//    → CreateSpreadsheet
//      → SetHeaders
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'Lp8w6i0ABbjBvJpN',
    name: 'Setup CRM Sheet',
    active: false,
    settings: { executionOrder: 'v1', callerPolicy: 'workflowsFromSameOwner', availableInMCP: false },
})
export class SetupCrmSheetWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: '347f2d8b-e028-444f-99ea-c5853ff40fd7',
        webhookId: 'setup-crm',
        name: 'Run Once',
        type: 'n8n-nodes-base.webhook',
        version: 2.1,
        position: [0, 300],
    })
    RunOnce = {
        httpMethod: 'GET',
        path: 'setup-crm',
        responseMode: 'lastNode',
        responseBinaryPropertyName: 'data',
    };

    @node({
        id: '0c75ad5d-c66e-4af9-a8d8-eb997df57b26',
        name: 'Create Spreadsheet',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [300, 300],
        credentials: { googleSheetsOAuth2Api: { id: 'BU7jKOxVkaiRJphj', name: 'Google Sheets' } },
    })
    CreateSpreadsheet = {
        resource: 'spreadsheet',
        operation: 'create',
        title: 'Speed to Lead CRM',
        sheetsUi: {
            sheetValues: [
                {
                    title: 'Leads',
                    hidden: false,
                },
            ],
        },
        options: {},
    };

    @node({
        id: '05f36cfe-bbcb-4596-8160-33458826376c',
        name: 'Set Headers',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [600, 300],
        credentials: { googleSheetsOAuth2Api: { id: 'BU7jKOxVkaiRJphj', name: 'Google Sheets' } },
    })
    SetHeaders = {
        resource: 'sheet',
        operation: 'update',
        documentId: {
            __rl: true,
            mode: 'id',
            value: '1mlozyJyFtkyAaqwopZZkDjIGnMWD91RJmaiVcy8WCJE',
        },
        sheetName: {
            __rl: true,
            mode: 'id',
            value: 'Leads',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Timestamp: 'Timestamp',
                Name: 'Name',
                Email: 'Email',
                Phone: 'Phone',
                Service: 'Service',
                Message: 'Message',
                Source: 'Source',
                Score: 'Score',
                AI_Summary: 'AI_Summary',
                Recommended_Action: 'Recommended_Action',
                Response_Sent: 'Response_Sent',
                Response_Time_Sec: 'Response_Time_Sec',
                Status: 'Status',
            },
        },
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.RunOnce.out(0).to(this.CreateSpreadsheet.in(0));
        this.CreateSpreadsheet.out(0).to(this.SetHeaders.in(0));
    }
}
