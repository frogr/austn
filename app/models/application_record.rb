class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class

  # First key of the two-key Postgres advisory locks, one per kind of lock,
  # so different features can never block each other by accident.
  ADVISORY_LOCK_NAMESPACES = {
    invoice_numbers: 1,
    booking_slots: 2
  }.freeze

  # Takes a Postgres advisory lock that is held until the current
  # transaction commits or rolls back. Call it inside a transaction to
  # serialize a read-then-write that a unique index alone can't.
  def self.advisory_xact_lock(namespace, key)
    sql = sanitize_sql_array([ "SELECT pg_advisory_xact_lock(?, ?)", ADVISORY_LOCK_NAMESPACES.fetch(namespace), key ])
    connection.execute(sql)
  end
end
