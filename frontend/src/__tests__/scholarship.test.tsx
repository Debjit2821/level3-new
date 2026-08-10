import { describe, it, expect } from 'vitest';
import { useScholarshipStore } from '../store/scholarshipStore';
import { ApplicationStatus } from '../types';

describe('ScholarshipStore Management', () => {
  it('should create a new scholarship program', async () => {
    const initialCount = useScholarshipStore.getState().programs.length;
    const newId = await useScholarshipStore
      .getState()
      .createProgram('Test Grant 2026', 1000, 2, 500, 'GBXN...4K90');

    expect(newId).toBeGreaterThan(0);
    expect(useScholarshipStore.getState().programs.length).toBe(initialCount + 1);
  });

  it('should register student application and perform admin approval', async () => {
    const appCount = useScholarshipStore.getState().applications.length;
    const appId = await useScholarshipStore
      .getState()
      .applyScholarship(1, 'Charlie', 'GC7K...3M4N');

    expect(appId).toBeGreaterThan(0);

    const appBefore = useScholarshipStore
      .getState()
      .applications.find((a) => a.id === appId);
    expect(appBefore?.status).toBe(ApplicationStatus.Pending);

    await useScholarshipStore.getState().approveApplication(appId, 'GBXN...4K90');

    const appAfter = useScholarshipStore
      .getState()
      .applications.find((a) => a.id === appId);
    expect(appAfter?.status).toBe(ApplicationStatus.Approved);
  });
});
