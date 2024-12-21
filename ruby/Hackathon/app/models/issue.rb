class Issue < ApplicationRecord
  enum error_type: { console: 0, network: 1 }
  belongs_to :action, foreign_key: :action_uid, primary_key: :uid, inverse_of: :issues
  belongs_to :url, foreign_key: :url_uid, primary_key: :uid, inverse_of: :issues
end