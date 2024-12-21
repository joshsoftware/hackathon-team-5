module Api
  module V1
    class LogsController < ApplicationController
      attr_reader :param

      def index
        # Fetch all actions and include their associated urls and issues
        actions = Action.includes(urls: :issues).all

        # Create the desired structure for the response
        result = actions.group_by(&:domain).map do |domain, actions_in_domain|
          {
            "domain" => domain,
            "logs" => actions_in_domain.flat_map do |action|
              action.urls.map do |url|
                {
                  "action_type" => action.flow,  # action.flow will give you 'check_out' or 'listing'
                  "url" => url.link,  # Assuming 'link' is the field containing the URL
                  "console_error" => url.issues&.where(error_type: 'console').first&.issue,
                  "network_error" => url.issues&.where(error_type: 'network').first&.issue
                }
              end
            end
          }
        end

        render json: result
      end

      def create
        result = create_data

        if result
          render json:  { success: true }, status: :created
        else
          render json:  { success: false, error: "Internal error" }, status: :unprocessable_entity
        end
      end

      private

      def create_data
        @param = logs_params
        param["logs"].each do |h|
          ActiveRecord::Base.transaction do
            create_action_item(h)
          end
        end
        true
      end

      def create_action_item(hash)
        action = Action.create(flow: hash["action_type"], domain: param["domain"], explanation: param["explanation"] )
        action.reload
        create_url_item(hash, action.uid)
      end

      def create_url_item(hash, action_uid)
        url = Url.create(action_uid: action_uid, link: hash["url"])
        url.reload
        create_issue_item(hash, action_uid, url.uid)
      end

      def create_issue_item(hash, action_uid, url_uid)
        byebug
        Issue.create(action_uid: action_uid, url_uid: url_uid, error_type: "console", issue: hash["console_error"] )
        Issue.create(action_uid: action_uid, url_uid: url_uid, error_type: "network", issue: hash["network_error"] )
      end

      def logs_params
        params.permit!
      end
    end
    end
  end