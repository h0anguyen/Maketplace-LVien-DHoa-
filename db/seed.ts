import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import path from "path";
//     npx ts-node db/seed.ts
// chú ý userId

const prisma = new PrismaClient();

function convertFilesToBase64(): Buffer[] {
  let fileimage: Buffer[] = [];
  for (let i = 2; i <= 9; i++) {
    const filePath = path.join(
      __dirname,
      `../app/assets/images/demos/demo-17/products/product-${i}.jpg`
    );
    const fileReaded = readFileSync(filePath);
    const encodeFile = fileReaded.toString("base64");
    fileimage.push(Buffer.from(encodeFile, "base64"));
  }

  return fileimage;
}

async function seedCategories() {
  const categories = [
    "Thời trang nam",
    "Thời trang nữ",
    "Điện thoại và phụ kiện",
    "Máy tính và Laptop",
    "Điện tử gia dụng",
    "Sách và văn phòng phẩm",
    "Đồ chơi trẻ em",
    "Đồ dùng thể thao",
    "Sức khỏe và làm đẹp",
    "Nhà cửa và đời sống",
    "Ô tô và xe máy",
    "Đồ điện và công nghệ",
  ];

  await Promise.all(
    categories.map(async (category) => {
      const existingCategory = await prisma.categories.findFirst({
        where: { categoryName: category },
      });

      if (!existingCategory) {
        await prisma.categories.create({
          data: { categoryName: category },
        });
      }
    })
  );
}

async function main() {
  console.log("Start seeding...");

  await seedCategories();
  
  const images = convertFilesToBase64();
  const imageCount = images.length;

  const allCategories = await prisma.categories.findMany();


  for (let i = 0; i < 100; i++) {
    const mainImage = images[i % imageCount];

    await prisma.products.create({
      data: {
        productName: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price()),
        inventory: faker.number.int({ min: 1, max: 100 }),
        mainImage,
        view: faker.number.int({ min: 1, max: 100 }),
        sold: faker.number.int({ min: 1, max: 100 }),
        categories: {
          connect: {
            id: allCategories[
              faker.number.int({ min: 0, max: allCategories.length - 1 })
            ].id,
          },
        },
        user: { connect: { id: 1 } },
      },
    });
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
