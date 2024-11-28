import { setupServer } from 'msw/node';
import { rest } from 'msw'; // ここを確認

export const server = setupServer(
  rest.get('/api/reports', (req, res, ctx) => {
    return res(ctx.json([
      { id: 1, name: 'Report 1', site: 'Site 1', inputtime: '10:00' },
      { id: 2, name: 'Report 2', site: 'Site 2', inputtime: '11:00' },
    ]));
  }),
  rest.get('/api/doctors', (req, res, ctx) => {
    return res(ctx.json([
      { docid: 1, docname: 'Doctor 1', department: 'Cardiology', hostital: 'Hospital 1' },
      { docid: 2, docname: 'Doctor 2', department: 'Neurology', hostital: 'Hospital 2' },
    ]));
  }),
  rest.get('/api/ptinfos', (req, res, ctx) => {
    return res(ctx.json([
      { id: 1, name: 'Patient 1', age: 30, condition: 'Condition 1' },
      { id: 2, name: 'Patient 2', age: 40, condition: 'Condition 2' },
    ]));
  })
);