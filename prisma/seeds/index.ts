import { seedFacility } from './seedFacility';
import { seedFacilityType } from './seedFacilityType';
import { seedNewsCategory } from './seedMediaCategory';
import { seedMenus } from './seedMenus';
import { seedPages } from './seedPage';
import { seedProductCategory } from './seedProductCategory';
import { seedRoles } from './seedRole';
import { seedUser } from './seedUser';

export async function runAllSeeds() {
  await seedMenus();
  await seedRoles();
  await seedUser();
  await seedFacilityType();
  await seedFacility();
  await seedPages();
  await seedNewsCategory();
  await seedProductCategory();
}
