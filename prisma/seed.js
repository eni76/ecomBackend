const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const { uploadToCloudinary } = require('../utils/uploadToCloudinary')

const prisma = new PrismaClient()

// Import your cloudinary upload util
// <-- adjust the correct path

// Load product data
const productsData = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../../ecommerce/data/data.json'),
    'utf-8'
  )
)

async function main () {
  console.log('🌱 Starting seed...')

  // 1. Create categories
  const categories = ['men', 'women', 'children']

  for (const categoryName of categories) {
    await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName }
    })
    console.log(`✅ Category ready: ${categoryName}`)
  }

  // Fetch categories
  const categoryMap = {
    men: (await prisma.category.findUnique({ where: { name: 'men' } })).id,
    women: (await prisma.category.findUnique({ where: { name: 'women' } })).id,
    children: (
      await prisma.category.findUnique({ where: { name: 'children' } })
    ).id
  }

  console.log('\n📦 Adding products...')

  let success = 0
  let failed = 0

  for (const product of productsData.products) {
    try {
      const categoryid = categoryMap[product.category]

      if (!categoryid) {
        console.log(
          `❌ Skipping ${product.name}: Invalid category ${product.category}`
        )
        failed++
        continue
      }

      const exists = await prisma.product.findFirst({
        where: { name: product.name }
      })
      if (exists) {
        console.log(`⏭️ Exists: ${product.name}`)
        continue
      }

      // ------------------------------
      // ⭐ READ IMAGE AS FILE BUFFER
      // ------------------------------
      const imagePath = path.join(
        __dirname,
        '../../ecommerce/public',
        product.image.replace(/^\//, '') // remove leading slash
      )

      if (!fs.existsSync(imagePath)) {
        console.log(`❌ Image not found: ${product.image}`)
        failed++
        continue
      }

      const fileBuffer = fs.readFileSync(imagePath)

      // --------------------------------------
      // ⭐ UPLOAD USING YOUR CLOUDINARY UTILITY
      // --------------------------------------
      const cloudUrl = await uploadToCloudinary(fileBuffer, 'image', 'Product')

      if (!cloudUrl) {
        console.log(`❌ Cloudinary upload failed for: ${product.name}`)
        failed++
        continue
      }

      // ------------------------------
      // CREATE PRODUCT
      // ------------------------------
      await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          currency: product.currency,
          sizes: product.sizes,
          defaultSize: product.defaultSize,
          colors: product.colors,
          defaultColor: product.defaultColor,
          bestSeller: product.bestSeller,
          newArrival: product.newArrival || false,
          image: cloudUrl, // ⭐ Save cloudinary URL
          subcategory: product.subcategory,
          rating: product.rating,
          discount: product.discount,
          tags: product.tags,
          categoryid
        }
      })

      console.log(`✅ Added: ${product.name}`)
      success++
    } catch (error) {
      console.log(`❌ Failed for ${product.name}:`, error.message)
      failed++
    }
  }

  console.log('\n✨ Seed Complete!')
  console.log(`✔ Added: ${success}`)
  console.log(`✖ Errors: ${failed}`)
}

main()
  .catch(e => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
