import Image from "next/image";
import Link from "next/link";

export function Brand() {
  return <Link className="brand" href="/" aria-label="Beranda Pustaka">
    <Image className="logo-icon" src="/icon.svg" alt="" width={40} height={40} />
    pustaka
  </Link>;
}
