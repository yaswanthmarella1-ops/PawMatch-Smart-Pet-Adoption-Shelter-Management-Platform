const db = new Dexie('PawMatchDB_Final');

db.version(1).stores({
    animals: '++id, name, species, breed, status',
    applications: '++id, adopterName, animalId, status',
    visits: '++id, applicationId, date, time'
});

async function seedDatabase() {
    const count = await db.animals.count();
    if (count > 0) return; // Don't seed if data already exists

    // 1. ADD ANIMALS (Using high-quality Unsplash Images)
    await db.animals.bulkAdd([
        { name: 'Bruno', species: 'Dog', breed: 'Labrador mix', age: '3 yrs', status: 'Available', tags: ['Good with kids', 'House-trained'], image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600&auto=format&fit=crop' },
        { name: 'Mishti', species: 'Cat', breed: 'Domestic shorthair', age: '1 yr', status: 'Under Review', tags: ['Calm', 'Litter-trained'], image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600&auto=format&fit=crop' },
        { name: 'Sheru', species: 'Dog', breed: 'Indie', age: '5 yrs', status: 'Available', tags: ['Leash-trained', 'Needs yard'], image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=600&auto=format&fit=crop' },
        { name: 'Coco', species: 'Rabbit', breed: 'Dutch', age: '2 yrs', status: 'Available', tags: ['Bonded pair', 'Gentle'], image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?q=80&w=600&auto=format&fit=crop' },
        { name: 'Luna', species: 'Cat', breed: 'Persian mix', age: '7 yrs', status: 'Medical Hold', tags: ['Senior', 'Indoor only'], image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=600&auto=format&fit=crop' },
        { name: 'Rocky', species: 'Dog', breed: 'Beagle', age: '8 mos', status: 'Available', tags: ['Playful', 'In training'], image: 'https://images.unsplash.com/photo-1537151608804-ea2d1193d2ea?q=80&w=600&auto=format&fit=crop' },
        { name: 'Tara', species: 'Dog', breed: 'Indie', age: '2 yrs', status: 'Available', tags: ['Good with cats', 'Vaccinated'], image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?q=80&w=600&auto=format&fit=crop' },
        { name: 'Oreo', species: 'Cat', breed: 'Tuxedo', age: '4 mos', status: 'Available', tags: ['Kitten', 'Social'], image: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?q=80&w=600&auto=format&fit=crop' }
    ]);

    // 2. ADD APPLICATIONS
    await db.applications.bulkAdd([
        { adopterName: 'Priya Rao', animalId: 1, date: '2026-10-22', status: 'Visit Scheduled', eligibilityScore: 86 },
        { adopterName: 'Arjun Mehra', animalId: 2, date: '2026-10-24', status: 'Under Review', eligibilityScore: 65 },
        { adopterName: 'Kavya Iyer', animalId: 3, date: '2026-10-25', status: 'Awaiting Decision', eligibilityScore: 92 },
        { adopterName: 'Rahul Verma', animalId: 3, date: '2026-10-25', status: 'Mismatch', eligibilityScore: 40 }
    ]);

    // 3. ADD VISITS
    await db.visits.bulkAdd([
        { applicationId: 1, animalId: 1, date: '2026-11-07', time: '11:00', type: 'At the shelter', status: 'Scheduled' },
        { applicationId: 2, animalId: 2, date: '2026-11-03', time: '11:30', type: 'Video call', status: 'Scheduled' }
    ]);
}