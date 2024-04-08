import { PrismaClient, BoilerParts } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const boilerManufacturers = [
  'ElectroCore',
  'CircuitMaster',
  'QuantumChip',
  'NanoTech',
  'SiliconStream Solutions',
  'InfiniteCircuitry',
  'PrecisionParts Electronics',
  'TechGrid Accessories',
  'ComponentCrafters',
];
const partsManufacturers = [
  'Микросхемы (чипы)',
  'Транзисторы',
  'Резисторы',
  'Конденсаторы',
  'Индуктивные катушки',
  'Диоды',
  'Светодиоды (LED)',
  'Кварцевые резонаторы',
  'стабилизаторы напряжения',
  'Печатные платы (PCB)',
];

async function main() {
  const boilerPartsData: BoilerParts[] = Array.from(
    { length: 100 },
    (_, index) => ({
      id: index,
      boiler_manufacturer:
        boilerManufacturers[
          Math.floor(Math.random() * boilerManufacturers.length)
        ],
      parts_manufacturer:
        partsManufacturers[
          Math.floor(Math.random() * partsManufacturers.length)
        ],
      price: Number(faker.random.numeric(4)),
      name: faker.lorem.sentence(2),
      description: faker.lorem.sentence(10),
      images: JSON.stringify(
        Array.from(
          { length: 7 },
          () => `${faker.image.technics()}?random=${faker.random.numeric(30)}`,
        ),
      ),
      vendor_code: faker.internet.password(),
      in_stock: Number(faker.random.numeric(1)),
      bestseller: faker.datatype.boolean(),
      new: faker.datatype.boolean(),
      popularity: Number(faker.random.numeric(3)),
      compatibility: faker.lorem.sentence(7),
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  );

  for (const data of boilerPartsData) {
    await prisma.boilerParts.create({ data });
  }
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
