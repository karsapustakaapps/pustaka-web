export const initialBooks = [
  {
    slug: "pride-and-prejudice",
    genres: ["romansa","klasik"],
    cover: "/books/pride-and-prejudice.jpg",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    category: "Romansa",
    year: "1813",
    gutenberg: 1342,
    description:
      "Kesan pertama, prasangka, dan cinta yang tidak mengikuti aturan. Kenali Elizabeth Bennet dan Mr. Darcy lewat kisah Jane Austen.",
    excerpt:
      "Telah umum diakui bahwa seorang pria lajang yang memiliki kekayaan besar pasti membutuhkan seorang istri.",
  },
  {
    slug: "the-great-gatsby",
    genres: ["fiksi","drama","klasik"],
    cover: "/books/the-great-gatsby.jpg",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    category: "Fiksi",
    year: "1925",
    gutenberg: 64317,
    description:
      "Di balik pesta gemerlap era Jazz, seorang pria mengejar impian yang sulit diraih. Kisah tentang harapan, perubahan diri, dan masa lalu.",
    excerpt:
      "Pada masa mudaku, ketika aku lebih mudah terpengaruh, ayah memberiku nasihat yang terus kupikirkan hingga kini.",
  },
  {
    slug: "little-women",
    genres: ["fiksi","drama","klasik"],
    cover: "/books/little-women.jpg",
    title: "Little Women",
    author: "Louisa May Alcott",
    category: "Fiksi",
    year: "1868",
    gutenberg: 514,
    description:
      "Empat saudari dengan impian yang berbeda. Ikuti keluarga March melewati suka dan duka, ambisi, dan kehangatan rumah.",
    excerpt:
      "“Natal tidak akan terasa seperti Natal tanpa hadiah,” gerutu Jo sambil berbaring di karpet.",
  },
  {
    slug: "dorian-gray",
    genres: ["fiksi","gotik","klasik"],
    cover: "/books/dorian-gray.jpg",
    title: "The Picture of Dorian Gray",
    author: "Oscar Wilde",
    category: "Fiksi",
    year: "1890",
    gutenberg: 174,
    description:
      "Sebuah lukisan menyimpan rahasia yang semakin gelap. Oscar Wilde mengajak kita mempertanyakan kecantikan, kesenangan, dan hati nurani.",
    excerpt:
      "Ruangan itu dipenuhi aroma mawar. Ketika angin musim panas menggerakkan pepohonan di taman, wangi bunga lilac atau harum semak berduri berbunga merah muda masuk melalui pintu yang terbuka.",
  },
  {
    slug: "jane-eyre",
    genres: ["romansa","gotik","klasik"],
    cover: "/books/jane-eyre.jpg",
    title: "Jane Eyre",
    author: "Charlotte Brontë",
    category: "Romansa",
    year: "1847",
    gutenberg: 1260,
    description:
      "Jane mencari tempat untuk pulang, cinta, dan kebebasan menentukan hidupnya di tengah dunia yang penuh rahasia.",
    excerpt:
      "Tak ada kemungkinan untuk berjalan-jalan hari itu. Pagi tadi kami sempat menyusuri semak-semak tanpa daun selama satu jam. Namun, sejak makan siang, angin musim dingin membawa awan gelap dan hujan yang begitu deras hingga kami tak bisa lagi beraktivitas di luar.",
  },
  {
    slug: "metamorphosis",
    genres: ["fiksi","bacaan-singkat","klasik"],
    cover: "/books/metamorphosis.jpg",
    title: "The Metamorphosis",
    author: "Franz Kafka",
    category: "Bacaan singkat",
    year: "1915",
    gutenberg: 5200,
    description:
      "Suatu pagi, kehidupan Gregor Samsa berubah menjadi sesuatu yang asing. Cerita singkat tentang jati diri, kesendirian, dan hubungan keluarga.",
    excerpt:
      "Suatu pagi, saat Gregor Samsa terbangun dari mimpi yang gelisah, ia mendapati dirinya berubah menjadi seekor serangga mengerikan di atas tempat tidurnya.",
  },
] as const;
