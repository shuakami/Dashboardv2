export function TailwindIndicator() {
  if (process.env.NODE_ENV === "production") return null

  return (
    <div className="">
      <div className="block sm:hidden"></div>
      <div className="hidden sm:block md:hidden"></div>
      <div className="hidden md:block lg:hidden"></div>
      <div className="hidden lg:block xl:hidden"></div>
      <div className="hidden xl:block 2xl:hidden"></div>
      <div className="hidden 2xl:block"></div>
    </div>
  )
}
