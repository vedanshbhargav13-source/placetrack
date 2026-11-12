function Navbar() {
  return (
    <nav className="bg-gray-900 text-white px-6 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          PlaceTrack
        </h1>

        <div className="flex gap-6">
          <a href="#">Dashboard</a>
          <a href="#">Applications</a>
          <a href="#">Jobs</a>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;