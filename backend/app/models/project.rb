class Project < ApplicationRecord
  COVER_CONTENT_TYPES = %w[image/jpeg image/png].freeze
  COVER_MAX_SIZE = 5.megabytes
  MIN_SEARCH_LENGTH = 3

  # Whitelist of sort keys accepted by the API (`?sort=`). Unknown keys fall back to DEFAULT_SORT.
  SORTS = {
    "name" => :by_name,
    "recent_start" => :by_recent_start,
    "nearest_end" => :by_nearest_end
  }.freeze
  DEFAULT_SORT = "name"

  has_one_attached :cover

  validate :name_has_at_least_two_words
  validate :client_has_at_least_one_word
  validates :start_date, :end_date, presence: true
  validate :end_date_after_start_date
  validate :cover_is_a_valid_image

  scope :favorites, -> { where(favorite: true) }

  # Case-insensitive match on name or client. Terms shorter than MIN_SEARCH_LENGTH are ignored,
  # so the rule holds even if a client skips the frontend check.
  scope :search, ->(term) {
    term = term.to_s.strip
    next all if term.length < MIN_SEARCH_LENGTH

    pattern = "%#{sanitize_sql_like(term)}%"
    where("projects.name ILIKE :pattern OR projects.client ILIKE :pattern", pattern: pattern)
  }

  scope :sorted_by, ->(key) { public_send(SORTS.fetch(key.to_s, SORTS.fetch(DEFAULT_SORT))) }

  # Every order ends with `id` so pages stay stable when names or dates tie.
  scope :by_name, -> { order(Arel.sql("LOWER(projects.name)"), :id) }
  scope :by_recent_start, -> { order(start_date: :desc, id: :desc) }
  # Projects still running come first (closest end date first); finished ones go last.
  scope :by_nearest_end, -> {
    finished = sanitize_sql_array([ "projects.end_date < ?", Date.current ])
    order(Arel.sql(finished), :end_date, :id)
  }

  private

  def name_has_at_least_two_words
    errors.add(:name, :too_few_words, count: 2) if word_count(name) < 2
  end

  def client_has_at_least_one_word
    errors.add(:client, :too_few_words, count: 1) if word_count(client) < 1
  end

  def end_date_after_start_date
    return if start_date.blank? || end_date.blank?

    errors.add(:end_date, :before_start_date) if end_date <= start_date
  end

  def cover_is_a_valid_image
    return unless cover.attached?

    errors.add(:cover, :invalid_content_type) unless cover.blob.content_type.in?(COVER_CONTENT_TYPES)
    errors.add(:cover, :too_large, count: COVER_MAX_SIZE / 1.megabyte) if cover.blob.byte_size > COVER_MAX_SIZE
  end

  def word_count(value)
    value.to_s.split.size
  end
end
