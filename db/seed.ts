import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

//     npx ts-node db/seed.ts
// chú ý userId

const prisma = new PrismaClient();

function getImagesFromAssets(): Buffer[] {
  const imagesPath = path.join(
    __dirname,
    "../app/assets/images/demos/demo-17/products"
  );
  const imageFiles = fs.readdirSync(imagesPath);

  return imageFiles
    .map((file) => {
      // Kiểm tra nếu file không phải là null trước khi trả về
      if (file) {
        return Buffer.from(file); // Chuyển đổi file thành Buffer
      }
      return null; // Trả về null nếu file là null
    })
    .filter((file): file is Buffer => file instanceof Buffer); // Lọc bỏ các giá trị null
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

  const images = getImagesFromAssets();
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
