import { db } from "../config/firebase";
import { Pet } from "../types";

export const checkVaccinationConsistency = async (
    petId: string,
    prefetchedPetData?: Pet
): Promise<void> => {
    let petData: Pet;

    if (prefetchedPetData) {
        petData = prefetchedPetData;
    } else {
        const petDoc = await db.collection("pets").doc(petId).get();
        if (!petDoc.exists) return;
        petData = petDoc.data() as Pet;
    }

    const vaccineRecords = await db
        .collection("pets")
        .doc(petId)
        .collection("healthRecords")
        .where("type", "==", "vaccine")
        .limit(1)
        .get();

    const hasRecords = !vaccineRecords.empty;
    const isVaccinated = petData.isVaccinated === true;

    // Case 1 — marked vaccinated but no records
    if (isVaccinated && !hasRecords) {
        const existingNotif = await db
            .collection("adminNotifications")
            .where("petId", "==", petId)
            .where("type", "==", "missing_vaccine_record")
            .where("read", "==", false)
            .limit(1)
            .get();

        if (existingNotif.empty) {
            await db.collection("adminNotifications").add({
                type: "missing_vaccine_record",
                petId,
                petName: petData.name,
                message: `${petData.name} is marked as vaccinated but has no vaccine health record on file.`,
                read: false,
                resolved: false,
                createdAt: new Date(),
            });
        }

        await resolveNotifications(petId, "vaccine_record_mismatch");
    }

    // Case 2 — has records but marked as not vaccinated
    if (!isVaccinated && hasRecords) {
        const existingNotif = await db
            .collection("adminNotifications")
            .where("petId", "==", petId)
            .where("type", "==", "vaccine_record_mismatch")
            .where("read", "==", false)
            .limit(1)
            .get();

        if (existingNotif.empty) {
            await db.collection("adminNotifications").add({
                type: "vaccine_record_mismatch",
                petId,
                petName: petData.name,
                message: `${petData.name} has vaccine records but is not marked as vaccinated.`,
                read: false,
                resolved: false,
                createdAt: new Date(),
            });
        }

        await resolveNotifications(petId, "missing_vaccine_record");
    }

    // Case 3 — consistent, resolve all open notifs
    if ((isVaccinated && hasRecords) || (!isVaccinated && !hasRecords)) {
        await resolveNotifications(petId, "missing_vaccine_record");
        await resolveNotifications(petId, "vaccine_record_mismatch");
    }
};

const resolveNotifications = async (petId: string, type: string): Promise<void> => {
    const openNotifs = await db
        .collection("adminNotifications")
        .where("petId", "==", petId)
        .where("type", "==", type)
        .where("read", "==", false)
        .get();

    if (openNotifs.empty) return;

    const batch = db.batch();
    openNotifs.forEach((doc) => {
        batch.update(doc.ref, {
            read: true,
            resolved: true,
            resolvedAt: new Date(),
        });
    });
    await batch.commit();
};
