import { prisma } from '../db/client';

/**
 * Visa Service
 * Provides visa and travel requirement information
 */

export interface VisaInfo {
  nationality: string;
  destination: string;
  visaRequired: boolean;
  stayDuration?: string;
  passportValidity?: string;
  entryRequirements: string[];
  healthRequirements: string[];
  customsInfo?: string;
  travelAdvisories: string[];
  lastUpdated: Date;
  disclaimer: string;
}

/**
 * Get all available destination countries
 */
export async function getDestinationCountries() {
  const countries = await prisma.visaRequirement.groupBy({
    by: ['destinationCountry', 'destinationCode'],
  });

  return countries.map(c => ({
    name: c.destinationCountry,
    code: c.destinationCode,
  }));
}

/**
 * Get all nationality countries
 */
export async function getNationalityCountries() {
  const countries = await prisma.visaRequirement.groupBy({
    by: ['nationalityCountry', 'nationalityCode'],
  });

  return countries.map(c => ({
    name: c.nationalityCountry,
    code: c.nationalityCode,
  }));
}

/**
 * Get visa requirements for a destination country (all nationalities)
 */
export async function getVisaInfoByDestination(destinationCode: string) {
  const requirements = await prisma.visaRequirement.findMany({
    where: {
      destinationCode: destinationCode.toUpperCase(),
    },
    orderBy: {
      nationalityCountry: 'asc',
    },
  });

  return requirements.map(req => ({
    nationality: req.nationalityCountry,
    nationalityCode: req.nationalityCode,
    visaRequired: req.visaRequired,
    stayDuration: req.stayDuration || undefined,
    passportValidity: req.passportValidity || undefined,
    lastUpdated: req.lastUpdated,
  }));
}

/**
 * Check visa requirements for specific nationality and destination
 */
export async function checkVisaRequirements(
  nationalityCode: string,
  destinationCode: string
): Promise<VisaInfo | null> {
  const requirement = await prisma.visaRequirement.findUnique({
    where: {
      destinationCode_nationalityCode: {
        destinationCode: destinationCode.toUpperCase(),
        nationalityCode: nationalityCode.toUpperCase(),
      },
    },
  });

  if (!requirement) {
    return null;
  }

  return {
    nationality: requirement.nationalityCountry,
    destination: requirement.destinationCountry,
    visaRequired: requirement.visaRequired,
    stayDuration: requirement.stayDuration || undefined,
    passportValidity: requirement.passportValidity || undefined,
    entryRequirements: requirement.entryRequirements,
    healthRequirements: requirement.healthRequirements,
    customsInfo: requirement.customsInfo || undefined,
    travelAdvisories: requirement.travelAdvisories,
    lastUpdated: requirement.lastUpdated,
    disclaimer: 'Requirements subject to change. Verify with official government sources before travel.',
  };
}

/**
 * Get visa requirements by nationality (all destinations)
 */
export async function getVisaInfoByNationality(nationalityCode: string) {
  const requirements = await prisma.visaRequirement.findMany({
    where: {
      nationalityCode: nationalityCode.toUpperCase(),
    },
    orderBy: {
      destinationCountry: 'asc',
    },
  });

  return requirements.map(req => ({
    destination: req.destinationCountry,
    destinationCode: req.destinationCode,
    visaRequired: req.visaRequired,
    stayDuration: req.stayDuration || undefined,
    passportValidity: req.passportValidity || undefined,
    lastUpdated: req.lastUpdated,
  }));
}

/**
 * Get countries where visa is not required for a nationality
 */
export async function getVisaFreeCountries(nationalityCode: string) {
  const requirements = await prisma.visaRequirement.findMany({
    where: {
      nationalityCode: nationalityCode.toUpperCase(),
      visaRequired: false,
    },
    orderBy: {
      destinationCountry: 'asc',
    },
  });

  return requirements.map(req => ({
    destination: req.destinationCountry,
    destinationCode: req.destinationCode,
    stayDuration: req.stayDuration || undefined,
    entryRequirements: req.entryRequirements,
  }));
}

/**
 * Search visa requirements
 */
export async function searchVisaRequirements(query: string) {
  const requirements = await prisma.visaRequirement.findMany({
    where: {
      OR: [
        { destinationCountry: { contains: query, mode: 'insensitive' } },
        { nationalityCountry: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: 50,
  });

  return requirements.map(req => ({
    nationality: req.nationalityCountry,
    nationalityCode: req.nationalityCode,
    destination: req.destinationCountry,
    destinationCode: req.destinationCode,
    visaRequired: req.visaRequired,
    stayDuration: req.stayDuration || undefined,
  }));
}
