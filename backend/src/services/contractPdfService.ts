import PDFDocument from "pdfkit";
import { bucket } from "../config/firebase";

export interface ContractPdfData {
	contractId: string;
	petName: string;
	petSpecies: string;
	petBreed: string;
	adopterName: string;
	adopterEmail: string;
	shelterName: string;
	adoptionDate: string;
}

export async function generateContractPdf(data: ContractPdfData): Promise<string> {
	return new Promise((resolve, reject) => {
		const chunks: Buffer[] = [];

		const doc = new PDFDocument({
			size: "A4",
			margins: { top: 50, bottom: 50, left: 50, right: 50 },
		});

		doc.on("data", (chunk: Buffer) => chunks.push(chunk));
		doc.on("end", async () => {
			const pdfBuffer = Buffer.concat(chunks);

			try {
				const filename = `contracts/${data.contractId}.pdf`;
				const file = bucket.file(filename);

				await file.save(pdfBuffer, {
					contentType: "application/pdf",
					metadata: {
						metadata: {
							firebaseStorageDownloadTokens: data.contractId,
						},
					},
				});

				await file.makePublic();
				const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

				resolve(publicUrl);
			} catch (error) {
				console.error("Error uploading PDF to Firebase Storage:", error);
				reject(error);
			}
		});

		doc.on("error", reject);

		doc.fontSize(24).font("Helvetica-Bold").text("ADOPTION CONTRACT", { align: "center" });
		doc.moveDown(0.5);
		doc.fontSize(12)
			.font("Helvetica")
			.text(`Contract ID: ${data.contractId}`, { align: "center" });
		doc.moveDown(2);

		doc.fontSize(16).font("Helvetica-Bold").text("Pet Information");
		doc.fontSize(12).font("Helvetica");
		doc.text(`Name: ${data.petName}`);
		doc.text(`Species: ${data.petSpecies}`);
		doc.text(`Breed: ${data.petBreed}`);
		doc.moveDown(1.5);

		doc.fontSize(16).font("Helvetica-Bold").text("Adopter Information");
		doc.fontSize(12).font("Helvetica");
		doc.text(`Name: ${data.adopterName}`);
		doc.text(`Email: ${data.adopterEmail}`);
		doc.moveDown(1.5);

		doc.fontSize(16).font("Helvetica-Bold").text("Shelter Information");
		doc.fontSize(12).font("Helvetica");
		doc.text(`Name: ${data.shelterName}`);
		doc.moveDown(1.5);

		doc.fontSize(16).font("Helvetica-Bold").text("Adoption Details");
		doc.fontSize(12).font("Helvetica");
		doc.text(`Adoption Date: ${data.adoptionDate}`);
		doc.text(`Contract Duration: 1 year from adoption date`);
		doc.moveDown(2);

		doc.fontSize(16).font("Helvetica-Bold").text("Terms and Conditions");
		doc.fontSize(11).font("Helvetica");
		const terms = [
			"1. The adopter agrees to provide a safe, loving, and appropriate home for the pet.",
			"2. The adopter agrees to provide regular veterinary care, including vaccinations and check-ups.",
			"3. The pet may not be re-homed, sold, or given away without prior approval from the shelter.",
			"4. The shelter reserves the right to conduct periodic welfare checks to ensure the pet's well-being.",
			"5. If the adopter is unable to keep the pet, the pet must be returned to the shelter.",
			"6. This contract is binding for a period of one (1) year from the adoption date.",
			"7. The adopter agrees to comply with all local laws and regulations regarding pet ownership.",
			"8. The shelter provides the pet in good health at the time of adoption.",
		];

		terms.forEach((term) => {
			doc.text(term);
			doc.moveDown(0.5);
		});

		doc.moveDown(2);

		doc.fontSize(16).font("Helvetica-Bold").text("Signatures");
		doc.moveDown(1);

		doc.fontSize(12).font("Helvetica");
		doc.text("Adopter Signature: _______________________________");
		doc.moveDown(0.5);
		doc.text(`Date: ${new Date().toLocaleDateString()}`);
		doc.moveDown(1.5);

		doc.text("Shelter Representative: ___________________________");
		doc.moveDown(0.5);
		doc.text(`Date: ${new Date().toLocaleDateString()}`);
		doc.moveDown(2);

		doc.fontSize(10)
			.font("Helvetica-Oblique")
			.text(
				"This document serves as a legal agreement between the adopter and the shelter. By signing, both parties agree to the terms and conditions outlined above.",
				{ align: "center" }
			);

		doc.moveDown(1);
		doc.fontSize(8)
			.font("Helvetica")
			.text(`Generated on ${new Date().toISOString()} | Snuggles Pet Adoption Platform`, {
				align: "center",
			});

		doc.end();
	});
}
